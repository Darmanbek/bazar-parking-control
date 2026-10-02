// MSW handlers for the route-control contract (§7), development only. Bodies
// are checked against the generated Schemas (`satisfies`), so the mocks cannot
// drift from api/openapi.yaml without a TS error. Logins:
//   inspector / inspector — a normal account
//   expired   / inspector — 401 account_expired after a correct password

import dayjs from "dayjs"
import { delay, http, HttpResponse } from "msw"
import type { Schemas } from "src/shared/api"
import { API_URL, TIMEZONE } from "src/shared/config"
import { normalizePlate, shiftDate } from "src/shared/utils"
import {
	addAssignment,
	addContract,
	addRoute,
	appliesOn,
	assignments,
	candidatesFor,
	contractById,
	contracts,
	currentContract,
	FIRST_IMPORT_DATE,
	FLOOR_MIN_DAYS,
	FLOOR_MIN_VISITS,
	type MockAssignment,
	makePlate,
	othersOn,
	registryState,
	routeById,
	routes,
	today,
	VIEW_WINDOW_DAYS,
	verdictOf,
	visitDay,
	visits,
	windowStart,
} from "./db.ts"
import { renderPhoto } from "./photo.ts"

const api = (path: string) => `${API_URL}${path}`

const MOCK_TOKEN = "mock-route-control-token"
const PASSWORD = "inspector"

const json = <T>(body: T, status = 200) => HttpResponse.json(body as never, { status })
const fail = (status: number, body: Schemas["ErrorResponse"]) => json(body, status)
const invalid = (field: string, text: string, code?: string) =>
	fail(422, { message: text, errors: { [field]: [text] }, ...(code ? { code } : {}) })

const authed = (request: Request) => request.headers.get("Authorization") === `Bearer ${MOCK_TOKEN}`
const unauthenticated = () => fail(401, { message: "Unauthenticated.", code: "unauthenticated" })

const PLATE = /^\d{2}[A-Z0-9]{6}$/

/** `date` query param inside the view window, `max` included; a 422 otherwise. */
const dayParam = (url: URL, fallback: string, max = today()) => {
	const raw = url.searchParams.get("date")
	if (raw === null) return { date: fallback }
	if (!/^\d{4}-\d{2}-\d{2}$/.test(raw) || raw < windowStart() || raw > max)
		return { error: invalid("date", "Дата вне окна просмотра.") }
	return { date: raw }
}

const paginate = <T>(rows: T[], url: URL) => {
	const page = Math.max(Number(url.searchParams.get("page")) || 1, 1)
	const perPage = Math.min(Math.max(Number(url.searchParams.get("per_page")) || 50, 1), 200)
	return {
		data: rows.slice((page - 1) * perPage, page * perPage),
		links: { first: null, last: null, prev: null, next: null },
		pageMeta: { current_page: page, per_page: perPage, total: rows.length },
	}
}

const routeRef = (routeId: number): Schemas["RouteRef"] => {
	const r = routeById(routeId)!
	return { id: r.id, number: r.number, name: r.name }
}

const assignmentHistory = (a: MockAssignment): Schemas["AssignmentHistoryItem"] => ({
	id: a.id,
	plate: a.plate,
	original_plate: a.originalPlate,
	from: a.from,
	until: a.until,
	corrections: a.corrections,
})

const assignmentBody = (a: MockAssignment): Schemas["Assignment"] => ({
	...assignmentHistory(a),
	contract_id: a.contractId,
	route_id: contractById(a.contractId)!.routeId,
})

const assignedOn = (contractId: number, date: string) =>
	assignments.filter((a) => a.contractId === contractId && appliesOn(a, date)).length

const passesOn = (date: string) =>
	visits
		.filter((v) => visitDay(v) === date)
		.map((v) => ({ visit: v, verdict: verdictOf(v.plate, date) }))
		.filter(({ verdict }) => verdict.status !== "not_in_registry")
		.reverse()

const levenshtein = (a: string, b: string): number => {
	const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)] as number[])
	for (let j = 1; j <= b.length; j++) dp[0][j] = j
	for (let i = 1; i <= a.length; i++)
		for (let j = 1; j <= b.length; j++)
			dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
	return dp[a.length][b.length]
}

/** An assignment of `plate` overlapping [from, until) other than `except`. */
const conflictOf = (plate: string, from: string, until: string | null, except?: number) =>
	assignments.find(
		(a) =>
			a.id !== except &&
			a.plate === plate &&
			!(a.until !== null && a.until <= a.from) &&
			(a.until === null || a.until > from) &&
			(until === null || a.from < until)
	)

const conflictBody = (a: MockAssignment) => ({
	message: "Номер уже назначен.",
	errors: { plate: ["Номер уже назначен на пересекающийся период."] },
	code: "plate_conflict",
	conflict: {
		assignment_id: a.id,
		route_number: routeById(contractById(a.contractId)!.routeId)!.number,
		from: a.from,
		until: a.until,
	},
})

const xlsx = async (sheet: string, header: string[], rows: (string | number)[][]) => {
	const { Workbook } = await import("exceljs")
	const wb = new Workbook()
	const ws = wb.addWorksheet(sheet)
	ws.addRow(header)
	for (const row of rows) ws.addRow(row.map(String))
	const buffer = await wb.xlsx.writeBuffer()
	return new HttpResponse(buffer as ArrayBuffer, {
		headers: { "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" },
	})
}

// ---- Import previews (one live preview per inspector) -------------------------

interface Preview {
	data: Schemas["Import"]
	apply: () => void
}
let preview: Preview | undefined
let importSeq = 7

const endOfTashkentDay = () => dayjs().tz(TIMEZONE).endOf("day")

const buildPreview = (fileName: string): Preview => {
	const withErrors = /error|ошиб/i.test(fileName)
	const day = today()
	const rows: Schemas["ImportRow"][] = []
	const route = routes[0]
	const contract = currentContract(route.id, day)!
	const active = assignments.filter((a) => a.contractId === contract.id && appliesOn(a, day))
	let row = 4
	for (const a of active.slice(1)) {
		rows.push({
			row: row++,
			route_number: route.number,
			carrier: contract.carrier,
			plate: a.plate,
			action: "unchanged",
			from: null,
			until: null,
			errors: [],
			warnings: [],
		})
	}
	const added = makePlate()
	rows.push({
		row: row++,
		route_number: route.number,
		carrier: contract.carrier,
		plate: added,
		action: "add_assignment",
		from: day,
		until: null,
		errors: [],
		warnings: [],
	})
	const closed = active[0]
	rows.push({
		row: null,
		assignment_id: closed.id,
		route_number: route.number,
		carrier: contract.carrier,
		plate: closed.plate,
		action: "close_assignment",
		from: null,
		until: day,
		errors: [],
		warnings: [{ code: "close_affects_today", message: "Заезды этого номера сегодня с 00:00 станут «Muddati o'tgan»" }],
	})
	const newRouteNumber = `N-${30 + importSeq}`
	const newPlates = [makePlate(), makePlate()]
	rows.push({
		row: row,
		route_number: newRouteNumber,
		carrier: "ООО «Новый перевозчик»",
		plate: null,
		action: "new_route",
		from: null,
		until: null,
		errors: [],
		warnings: [],
	})
	for (const plate of newPlates)
		rows.push({
			row: row++,
			route_number: newRouteNumber,
			carrier: "ООО «Новый перевозчик»",
			plate,
			action: "add_assignment",
			from: day,
			until: null,
			errors: [],
			warnings: [],
		})
	if (withErrors) {
		rows.push({
			row: row++,
			route_number: newRouteNumber,
			carrier: "ООО «Новый перевозчик»",
			plate: "00A!",
			action: "error",
			from: null,
			until: null,
			errors: [{ code: "plate_invalid", message: "Некорректный номер" }],
			warnings: [],
		})
		rows.push({
			row: row++,
			route_number: null,
			carrier: null,
			plate: null,
			action: "error",
			from: null,
			until: null,
			errors: [{ code: "carrier_missing", message: "Не указан перевозчик" }],
			warnings: [],
		})
	}
	const count = (action: Schemas["ImportAction"]) => rows.filter((r) => r.action === action).length
	const errors = rows.reduce((s, r) => s + r.errors.length, 0)
	const expires = dayjs().add(1, "hour").isBefore(endOfTashkentDay()) ? dayjs().add(1, "hour") : endOfTashkentDay()

	const data: Schemas["Import"] = {
		id: importSeq++,
		status: "previewed",
		file_name: fileName,
		created_at: dayjs().toISOString(),
		expires_at: expires.toISOString(),
		confirmed_at: null,
		effective_date: day,
		can_confirm: errors === 0,
		summary: {
			routes_new: count("new_route"),
			contracts_new: count("new_route") + count("new_contract"),
			contracts_changed: count("new_contract"),
			assignments_add: count("add_assignment"),
			assignments_close: count("close_assignment"),
			assignments_move: count("move_assignment"),
			assignments_reopen: count("reopen_assignment"),
			unchanged: count("unchanged"),
			errors_count: errors,
			warnings_count: rows.reduce((s, r) => s + r.warnings.length, 0),
		},
		rows,
	}
	return {
		data,
		apply: () => {
			addAssignment(contract.id, added, day)
			closed.until = day
			const created = addRoute(newRouteNumber, "Новый маршрут из файла")
			const c = addContract({
				routeId: created.id,
				carrier: "ООО «Новый перевозчик»",
				validFrom: `${day.slice(0, 4)}-01-01`,
				validUntil: `${day.slice(0, 4)}-12-31`,
				quota: 5,
			})
			for (const plate of newPlates) addAssignment(c.id, plate, day)
		},
	}
}

const previewAlive = (p: Preview | undefined, id: number) =>
	p && p.data.id === id && (p.data.status === "confirmed" || dayjs().isBefore(p.data.expires_at!)) ? p : undefined

// ---- Handlers -------------------------------------------------------------------

export const handlers = [
	http.post(api("/auth/login"), async ({ request }) => {
		await delay(400)
		const body = (await request.json()) as Schemas["LoginRequest"]
		if (!["inspector", "expired"].includes(body.login) || body.password !== PASSWORD) {
			// One message for every case — it does not reveal which logins exist.
			return invalid("login", "Неверный логин или пароль.")
		}
		if (body.login === "expired") return fail(401, { message: "Account expired.", code: "account_expired" })
		return json({
			data: {
				token: MOCK_TOKEN,
				token_type: "Bearer",
				expires_at: dayjs().add(8, "hour").toISOString(),
				user: { id: 101, name: "Иванов И. И.", role: "route_inspector" },
			},
		} satisfies { data: Schemas["LoginResult"] })
	}),

	http.post(api("/auth/logout"), ({ request }) =>
		authed(request) ? new HttpResponse(null, { status: 204 }) : unauthenticated()
	),

	http.get(api("/me"), async ({ request }) => {
		await delay(150)
		if (!authed(request)) return unauthenticated()
		return json({
			data: {
				id: 101,
				name: "Иванов И. И.",
				login: "inspector",
				role: "route_inspector",
				account_expires_at: dayjs().add(300, "day").toISOString(),
				scope: { markets: [{ id: 1, name: "Рынок №1" }] },
				registry: { first_import_date: FIRST_IMPORT_DATE },
				limits: {
					view_window_days: VIEW_WINDOW_DAYS,
					visit_gap_minutes: 10,
					candidates: { window_days: 29, floor_min_days: FLOOR_MIN_DAYS, floor_min_visits: FLOOR_MIN_VISITS },
				},
			},
		} satisfies { data: Schemas["Me"] })
	}),

	http.get(api("/routes"), async ({ request }) => {
		await delay(200)
		if (!authed(request)) return unauthenticated()
		const d = dayParam(new URL(request.url), today())
		if (d.error) return d.error
		const date = d.date
		return json({
			data: routes.map((r) => {
				const c = currentContract(r.id, date)
				const assigned = c ? assignedOn(c.id, date) : 0
				return {
					id: r.id,
					number: r.number,
					name: r.name,
					contract: c
						? { id: c.id, carrier: c.carrier, valid_from: c.validFrom, valid_until: c.validUntil, quota: c.quota }
						: null,
					assigned_count: assigned,
					over_quota: c ? assigned > c.quota : false,
				}
			}),
		} satisfies { data: Schemas["RouteListItem"][] })
	}),

	http.get(api("/routes/:id"), async ({ request, params }) => {
		await delay(200)
		if (!authed(request)) return unauthenticated()
		const route = routeById(Number(params.id))
		if (!route) return fail(404, { message: "Not found." })
		return json({
			data: {
				id: route.id,
				number: route.number,
				name: route.name,
				contracts: contracts
					.filter((c) => c.routeId === route.id)
					.sort((a, b) => b.validFrom.localeCompare(a.validFrom))
					.map((c) => ({
						id: c.id,
						carrier: c.carrier,
						valid_from: c.validFrom,
						valid_until: c.validUntil,
						quota: c.quota,
						assignments: assignments
							.filter((a) => a.contractId === c.id)
							.sort((a, b) => b.from.localeCompare(a.from) || b.id - a.id)
							.map(assignmentHistory),
					})),
			},
		} satisfies { data: Schemas["RouteDetail"] })
	}),

	http.post(api("/registry/imports"), async ({ request }) => {
		await delay(700)
		if (!authed(request)) return unauthenticated()
		const form = await request.formData()
		const file = form.get("file")
		if (!(file instanceof File))
			return fail(422, { message: "Нет файла.", errors: { file: ["Нет файла."] }, reason: "unreadable" })
		if (!file.name.toLowerCase().endsWith(".xlsx"))
			return fail(422, { message: "Не .xlsx.", errors: { file: ["Не .xlsx."] }, reason: "not_xlsx" })
		if (file.size > 10 * 1024 * 1024) return new HttpResponse(null, { status: 413 })
		preview = buildPreview(file.name)
		return json({ data: preview.data }, 201)
	}),

	http.get(api("/registry/imports/:id"), async ({ request, params }) => {
		await delay(150)
		if (!authed(request)) return unauthenticated()
		const p = previewAlive(preview, Number(params.id))
		if (!p) return fail(404, { message: "Not found." })
		return json({ data: p.data })
	}),

	http.post(api("/registry/imports/:id/confirm"), async ({ request, params }) => {
		await delay(500)
		if (!authed(request)) return unauthenticated()
		const p = previewAlive(preview, Number(params.id))
		if (!p) return fail(404, { message: "Not found." })
		if (p.data.status === "confirmed")
			return fail(409, { message: "Already confirmed.", code: "import_already_confirmed" })
		if (!p.data.can_confirm)
			return fail(422, { message: "Есть ошибки.", errors: { import: ["Есть ошибки."] }, code: "import_has_errors" })
		p.apply()
		// A confirmed import is a summary without rows (§7.3).
		const confirmed: Schemas["Import"] = {
			...p.data,
			status: "confirmed",
			expires_at: null,
			confirmed_at: dayjs().toISOString(),
			can_confirm: false,
		}
		delete confirmed.rows
		p.data = confirmed
		return json({ data: p.data })
	}),

	http.post(api("/assignments"), async ({ request }) => {
		await delay(300)
		if (!authed(request)) return unauthenticated()
		const body = (await request.json()) as Schemas["AssignmentCreate"]
		const contract = contractById(body.contract_id)
		if (!contract) return invalid("contract_id", "Договор не найден.")
		const plate = normalizePlate(body.plate ?? "")
		if (!PLATE.test(plate)) return invalid("plate", "Некорректный номер.")
		if (!body.from || body.from < today()) return invalid("from", "Дата не может быть раньше сегодняшней.")
		if (body.from < contract.validFrom || body.from > contract.validUntil)
			return invalid("from", "Дата вне срока договора.")
		const conflict = conflictOf(plate, body.from, null)
		if (conflict) return json(conflictBody(conflict), 422)
		const a = addAssignment(contract.id, plate, body.from)
		const assigned = assignedOn(contract.id, body.from)
		return json(
			{
				data: assignmentBody(a),
				warnings:
					assigned > contract.quota
						? [{ code: "quota_exceeded", quota: contract.quota, assigned_count: assigned }]
						: [],
			},
			201
		)
	}),

	http.post(api("/assignments/:id/close"), async ({ request, params }) => {
		await delay(300)
		if (!authed(request)) return unauthenticated()
		const a = assignments.find((x) => x.id === Number(params.id))
		if (!a) return fail(404, { message: "Not found." })
		if (a.until !== null) return fail(409, { message: "Already closed.", code: "assignment_already_closed" })
		const { until } = (await request.json()) as { until?: string }
		if (!until || until < today() || until <= a.from) return invalid("until", "Дата не раньше сегодня и позже начала.")
		a.until = until
		return json({ data: assignmentBody(a) })
	}),

	http.post(api("/assignments/:id/correct"), async ({ request, params }) => {
		await delay(300)
		if (!authed(request)) return unauthenticated()
		const a = assignments.find((x) => x.id === Number(params.id))
		if (!a) return fail(404, { message: "Not found." })
		const body = (await request.json()) as { plate?: string; reason?: string }
		const plate = normalizePlate(body.plate ?? "")
		if (!PLATE.test(plate)) return invalid("plate", "Некорректный номер.")
		if (plate === a.plate) return invalid("plate", "Номер не изменился.", "plate_unchanged")
		if (levenshtein(plate, a.originalPlate) > 2)
			return invalid("plate", "Отличие от исходного номера больше 2 символов.", "plate_difference_too_large")
		const conflict = conflictOf(plate, a.from, a.until, a.id)
		if (conflict) return json(conflictBody(conflict), 422)
		const recomputed = visits.filter((v) => v.plate === a.plate || v.plate === plate).length
		a.corrections.push({
			corrected_at: dayjs().toISOString(),
			corrected_by: "Иванов И. И.",
			previous_plate: a.plate,
			recomputed_visits_count: recomputed,
			reason: body.reason ?? null,
		})
		const previous = a.plate
		a.plate = plate
		return json({
			data: assignmentBody(a),
			correction: { previous_plate: previous, new_plate: plate, recomputed_visits_count: recomputed },
		})
	}),

	http.get(api("/passes"), async ({ request }) => {
		await delay(300)
		if (!authed(request)) return unauthenticated()
		const url = new URL(request.url)
		const d = dayParam(url, today())
		if (d.error) return d.error
		const date = d.date
		const status = url.searchParams.get("status")
		if (status && !["permitted", "expired"].includes(status)) return invalid("status", "Недопустимый статус.")
		if (registryState(date) === "not_maintained") {
			return json({
				data: [],
				links: {},
				meta: { current_page: 1, per_page: 50, total: 0, date, registry_state: "not_maintained", others: null },
			} satisfies Schemas["PassesPage"])
		}
		const rows = passesOn(date)
			.filter(({ verdict }) => !status || verdict.status === status)
			.map(({ visit, verdict }) => {
				const c = verdict.contract!
				const a = verdict.assignment!
				return {
					id: visit.id,
					plate: visit.plate,
					visited_at: visit.at,
					frames_count: visit.frames,
					status: verdict.status as "permitted" | "expired",
					expired_reason: verdict.expiredReason,
					route: routeRef(c.routeId),
					contract: { id: c.id, carrier: c.carrier, valid_from: c.validFrom, valid_until: c.validUntil },
					assignment: { id: a.id, from: a.from, until: a.until },
				}
			})
		const { data, links, pageMeta } = paginate(rows, url)
		const candidateSet =
			date === today()
				? new Set<string>()
				: new Set(candidatesFor(date, FLOOR_MIN_DAYS, FLOOR_MIN_VISITS).map((c) => c.plate))
		return json({
			data,
			links,
			meta: { ...pageMeta, date, registry_state: "maintained", others: othersOn(date, candidateSet) },
		} satisfies Schemas["PassesPage"])
	}),

	http.get(api("/candidates"), async ({ request }) => {
		await delay(400)
		if (!authed(request)) return unauthenticated()
		const url = new URL(request.url)
		const d = dayParam(url, shiftDate(today(), -1), shiftDate(today(), -1))
		if (d.error) return d.error
		const date = d.date
		const minDays = Math.max(Number(url.searchParams.get("min_days")) || FLOOR_MIN_DAYS, FLOOR_MIN_DAYS)
		const minVisits = Math.max(Number(url.searchParams.get("min_visits")) || FLOOR_MIN_VISITS, FLOOR_MIN_VISITS)
		if (minDays > 29) return invalid("min_days", "Не больше 29.")
		const thresholds = {
			window_days: 29,
			min_days: minDays,
			min_visits: minVisits,
			floor_min_days: FLOOR_MIN_DAYS,
			floor_min_visits: FLOOR_MIN_VISITS,
		}
		if (registryState(date) === "not_maintained") {
			return json({
				data: [],
				links: {},
				meta: {
					current_page: 1,
					per_page: 50,
					total: 0,
					date,
					registry_state: "not_maintained",
					thresholds,
					others: null,
				},
			} satisfies Schemas["CandidatesPage"])
		}
		const list = candidatesFor(date, minDays, minVisits)
		const rows: Schemas["Candidate"][] = list.map((c) => ({
			plate: c.plate,
			status: "not_in_registry",
			qualifying_days: c.qualifyingDays,
			total_visits: c.totalVisits,
			first_seen_date: c.days.at(-1)!.date,
			last_seen_date: c.days[0].date,
			last_pass: c.lastPassOnDate ? { id: c.lastPassOnDate.id, visited_at: c.lastPassOnDate.at } : null,
			days: c.days,
		}))
		const { data, links, pageMeta } = paginate(rows, url)
		return json({
			data,
			links,
			meta: {
				...pageMeta,
				date,
				registry_state: "maintained",
				thresholds,
				others: othersOn(date, new Set(list.map((c) => c.plate))),
			},
		} satisfies Schemas["CandidatesPage"])
	}),

	http.get(api("/summary/routes"), async ({ request }) => {
		await delay(300)
		if (!authed(request)) return unauthenticated()
		const d = dayParam(new URL(request.url), today())
		if (d.error) return d.error
		const date = d.date
		if (registryState(date) === "not_maintained") {
			return json({
				data: [],
				totals: null,
				meta: { date, registry_state: "not_maintained", others: null },
			} satisfies Schemas["RoutesSummary"])
		}
		const seenToday = new Set(visits.filter((v) => visitDay(v) === date).map((v) => v.plate))
		const data: Schemas["RouteSummaryItem"][] = routes.map((r) => {
			const c = currentContract(r.id, date)
			if (!c)
				return {
					route: routeRef(r.id),
					carrier: null,
					quota: null,
					assigned_count: 0,
					seen_assigned_count: 0,
					unseen_30d_count: 0,
					over_quota: false,
					no_active_contract: true,
				}
			const active = assignments.filter((a) => a.contractId === c.id && appliesOn(a, date))
			const unseen = active.filter((a) => {
				const from = [a.from, shiftDate(date, -29), windowStart()].sort().at(-1)!
				return !visits.some((v) => v.plate === a.plate && visitDay(v) >= from && visitDay(v) <= date)
			}).length
			return {
				route: routeRef(r.id),
				carrier: c.carrier,
				quota: c.quota,
				assigned_count: active.length,
				seen_assigned_count: active.filter((a) => seenToday.has(a.plate)).length,
				unseen_30d_count: unseen,
				over_quota: active.length > c.quota,
				no_active_contract: false,
			}
		})
		const sum = (k: "assigned_count" | "seen_assigned_count" | "unseen_30d_count") => data.reduce((s, r) => s + r[k], 0)
		const candidateSet =
			date === today()
				? new Set<string>()
				: new Set(candidatesFor(date, FLOOR_MIN_DAYS, FLOOR_MIN_VISITS).map((c) => c.plate))
		return json({
			data,
			totals: {
				assigned_count: sum("assigned_count"),
				seen_assigned_count: sum("seen_assigned_count"),
				unseen_30d_count: sum("unseen_30d_count"),
			},
			meta: { date, registry_state: "maintained", others: othersOn(date, candidateSet) },
		} satisfies Schemas["RoutesSummary"])
	}),

	http.get(api("/passes/:id/image"), async ({ request, params }) => {
		await delay(300)
		if (!authed(request)) return unauthenticated()
		const visit = visits.find((v) => v.id === Number(params.id))
		if (!visit) return fail(404, { message: "Not found." })
		const day = visitDay(visit)
		if (day < windowStart()) return fail(404, { message: "Not found." })
		if (verdictOf(visit.plate, day).status === "not_in_registry") {
			// Only a candidate's visit of that very `date`, by the server floors (§7.11).
			const date = new URL(request.url).searchParams.get("date") ?? shiftDate(today(), -1)
			const isCandidate = candidatesFor(date, FLOOR_MIN_DAYS, FLOOR_MIN_VISITS).some((c) => c.plate === visit.plate)
			if (date >= today() || day !== date || !isCandidate) return fail(404, { message: "Not found." })
		}
		const stamp = dayjs(visit.at).tz(TIMEZONE).format("DD.MM.YYYY HH:mm:ss")
		return new HttpResponse(renderPhoto(visit.plate, visit.id, stamp), {
			headers: { "Content-Type": "image/svg+xml", "Cache-Control": "private, no-store" },
		})
	}),

	http.get(api("/exports/passes"), async ({ request }) => {
		if (!authed(request)) return unauthenticated()
		const url = new URL(request.url)
		const d = dayParam(url, today())
		if (d.error) return d.error
		const status = url.searchParams.get("status")
		const rows = passesOn(d.date)
			.filter(({ verdict }) => !status || verdict.status === status)
			.map(({ visit, verdict }) => [
				dayjs(visit.at).tz(TIMEZONE).format("DD.MM.YYYY HH:mm"),
				visit.plate,
				verdict.status,
				routeById(verdict.contract!.routeId)!.number,
				verdict.contract!.carrier,
			])
		const others = othersOn(d.date, new Set())
		return xlsx(
			"Заезды",
			["Время", "Номер", "Статус", "Маршрут", "Перевозчик"],
			[...rows, ["Остальные", "", "", "", `${others.visits_count}`]]
		)
	}),

	http.get(api("/exports/candidates"), async ({ request }) => {
		if (!authed(request)) return unauthenticated()
		const url = new URL(request.url)
		const d = dayParam(url, shiftDate(today(), -1), shiftDate(today(), -1))
		if (d.error) return d.error
		const minDays = Math.max(Number(url.searchParams.get("min_days")) || FLOOR_MIN_DAYS, FLOOR_MIN_DAYS)
		const minVisits = Math.max(Number(url.searchParams.get("min_visits")) || FLOOR_MIN_VISITS, FLOOR_MIN_VISITS)
		const rows = candidatesFor(d.date, minDays, minVisits).map((c) => [c.plate, c.qualifyingDays, c.totalVisits])
		return xlsx("Кандидаты", ["Номер", "Дней ≥ N", "Заездов"], rows)
	}),
]
