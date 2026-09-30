// MSW handlers for the draft contract (api/openapi.draft.yaml). Response
// bodies are checked against the generated Schemas (`satisfies`), so the mocks
// and the screens cannot drift from the contract without a TS error.

import dayjs from "dayjs"
import { delay, http, HttpResponse } from "msw"
import type { Schemas } from "src/shared/api"
import { BASE_URL } from "src/shared/config"
import { db, inWindow, photoUrl, tick, type MockEvent } from "./db.ts"
import { renderPhoto } from "./photo.ts"

const api = (path: string) => `${BASE_URL}/api/v1${path}`

const MOCK_TOKEN = "mock-access-token"

const USER: Schemas["UserRead"] = { id: 1, username: "admin", full_name: "Дежурный охраны" }

const error = (detail: string, status: number) =>
	HttpResponse.json({ detail } satisfies Schemas["ErrorResponse"], { status })

const isAuthed = (request: Request) => request.headers.get("Authorization") === `Bearer ${MOCK_TOKEN}`

const pageOf = <T>(rows: T[], url: URL) => {
	const page = Math.max(Number(url.searchParams.get("page")) || 1, 1)
	const pageSize = Math.min(Math.max(Number(url.searchParams.get("page_size")) || 10, 1), 10000)
	return {
		data: rows.slice((page - 1) * pageSize, page * pageSize),
		meta: { total: rows.length, page, page_size: pageSize },
	}
}

const windowOf = (url: URL) => ({
	from: url.searchParams.get("date_from"),
	to: url.searchParams.get("date_to"),
})

/** One row per car seen in the window, newest detection first. */
const carsInWindow = (from: string | null, to: string | null): Schemas["CarRead"][] => {
	const byCar = new Map<number, MockEvent[]>()
	const firstSeen = new Map<number, string>()
	for (const e of db.events) {
		if (!firstSeen.has(e.carId)) firstSeen.set(e.carId, e.detectedAt)
		if (!inWindow(e.detectedAt, from, to)) continue
		const list = byCar.get(e.carId) ?? []
		list.push(e)
		byCar.set(e.carId, list)
	}
	const rows: Schemas["CarRead"][] = []
	for (const [carId, list] of byCar) {
		const car = db.carById(carId)
		if (!car) continue
		const last = list[list.length - 1]
		rows.push({
			id: car.id,
			number: car.number,
			status: car.status,
			first_seen_at: firstSeen.get(carId) ?? last.detectedAt,
			last_seen_at: last.detectedAt,
			visits_count: list.filter((e) => e.direction === "in").length || 1,
			photo_url: photoUrl(car.id, last.id),
		})
	}
	return rows.sort((a, b) => b.last_seen_at.localeCompare(a.last_seen_at))
}

export const handlers = [
	http.post(api("/auth/login"), async ({ request }) => {
		await delay(500)
		const body = (await request.json()) as Schemas["LoginRequest"]
		if (body.username !== "admin" || body.password !== "admin") return error("Неверный логин или пароль", 401)
		return HttpResponse.json({ access_token: MOCK_TOKEN, token_type: "bearer" } satisfies Schemas["TokenResponse"])
	}),

	http.get(api("/auth/me"), async ({ request }) => {
		await delay(150)
		if (!isAuthed(request)) return error("Не авторизован", 401)
		return HttpResponse.json(USER)
	}),

	http.get(api("/cars/stats"), async ({ request }) => {
		await delay(250)
		if (!isAuthed(request)) return error("Не авторизован", 401)
		tick()
		const { from, to } = windowOf(new URL(request.url))
		const rows = carsInWindow(from, to)
		const licensed = rows.filter((r) => r.status === "licensed").length
		return HttpResponse.json({
			total: rows.length,
			licensed,
			unlicensed: rows.length - licensed,
		} satisfies Schemas["CarsStats"])
	}),

	http.get(api("/cars"), async ({ request }) => {
		await delay(350)
		if (!isAuthed(request)) return error("Не авторизован", 401)
		tick()
		const url = new URL(request.url)
		const { from, to } = windowOf(url)
		const search = url.searchParams.get("search")?.replace(/\s+/g, "").toUpperCase()
		const status = url.searchParams.get("status")
		const rows = carsInWindow(from, to).filter(
			(r) => (!search || r.number.includes(search)) && (!status || r.status === status)
		)
		return HttpResponse.json(pageOf(rows, url) satisfies Schemas["CarsPage"])
	}),

	http.get(api("/cars/:carId"), async ({ request, params }) => {
		await delay(250)
		if (!isAuthed(request)) return error("Не авторизован", 401)
		const row = carsInWindow(null, null).find((r) => r.id === Number(params.carId))
		if (!row) return error("Машина не найдена", 404)
		return HttpResponse.json(row satisfies Schemas["CarRead"])
	}),

	http.get(api("/cars/:carId/history"), async ({ request, params }) => {
		await delay(300)
		if (!isAuthed(request)) return error("Не авторизован", 401)
		tick()
		const url = new URL(request.url)
		const { from, to } = windowOf(url)
		const carId = Number(params.carId)
		const rows: Schemas["CarEventRead"][] = db.events
			.filter((e) => e.carId === carId && inWindow(e.detectedAt, from, to))
			.reverse()
			.map((e) => ({ id: e.id, detected_at: e.detectedAt, direction: e.direction, photo_url: photoUrl(carId, e.id) }))
		return HttpResponse.json(pageOf(rows, url) satisfies Schemas["CarEventsPage"])
	}),

	// Camera snapshots, served here so photo_url behaves like a real media URL.
	http.get(`${BASE_URL}/media/cars/:carId/:file`, ({ params }) => {
		const car = db.carById(Number(params.carId))
		const eventId = Number(String(params.file).replace(".svg", ""))
		const event = db.events.find((e) => e.id === eventId)
		if (!car || !event) return new HttpResponse(null, { status: 404 })
		const stamp = dayjs(event.detectedAt).format("DD.MM.YYYY HH:mm:ss")
		return new HttpResponse(renderPhoto(car.number, car.id, stamp, event.direction), {
			headers: { "Content-Type": "image/svg+xml" },
		})
	}),
]
