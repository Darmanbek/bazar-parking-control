// In-memory route-control backend for `npm run dev` only (never in a build).
// It follows the contract's rules closely enough to exercise every screen:
// verdicts at the moment of a visit (§3.1), exclusive `until` / inclusive
// `valid_until` (§3.5), visits grouped per plate, candidates by K/N (§6),
// "registry not maintained" before the first import (§3.2).
//
// All plates are synthetic, in the contract's own placeholder style.

import dayjs from "dayjs"
import type { Schemas } from "src/shared/api"
import { TIMEZONE } from "src/shared/config"
import { shiftDate, tashkentToday } from "src/shared/utils"

export const VIEW_WINDOW_DAYS = 30
export const FLOOR_MIN_DAYS = 10
export const FLOOR_MIN_VISITS = 5

export const today = () => tashkentToday()
export const windowStart = () => shiftDate(today(), -(VIEW_WINDOW_DAYS - 1))

// Seeded PRNG (mulberry32): the same lot after every reload.
let seed = 20261002
const rand = (): number => {
	seed |= 0
	seed = (seed + 0x6d2b79f5) | 0
	let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
	t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
	return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}
const int = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min
const pick = <T>(list: readonly T[]): T => list[int(0, list.length - 1)]

const LETTERS = [..."ABCDEFHKMOPTXY"]
const usedPlates = new Set<string>()
export const makePlate = (): string => {
	for (;;) {
		const plate = `${pick(["95", "95", "95", "90", "01"])}${pick(LETTERS)}${String(int(0, 999)).padStart(3, "0")}${pick(LETTERS)}${pick(LETTERS)}`
		if (!usedPlates.has(plate)) {
			usedPlates.add(plate)
			return plate
		}
	}
}

// ---- Registry ---------------------------------------------------------------

export type MockCorrection = Schemas["Correction"]

export interface MockAssignment {
	id: number
	contractId: number
	plate: string
	originalPlate: string
	from: string
	until: string | null
	corrections: MockCorrection[]
}

export interface MockContract {
	id: number
	routeId: number
	carrier: string
	validFrom: string
	validUntil: string
	quota: number
}

export interface MockRoute {
	id: number
	number: string
	name: string
}

export const FIRST_IMPORT_DATE = shiftDate(today(), -20)

export const routes: MockRoute[] = []
export const contracts: MockContract[] = []
export const assignments: MockAssignment[] = []
let routeSeq = 1
let contractSeq = 40
let assignmentSeq = 900

export const addRoute = (number: string, name: string): MockRoute => {
	const route = { id: routeSeq++, number, name }
	routes.push(route)
	return route
}

export const addContract = (c: Omit<MockContract, "id">): MockContract => {
	const contract = { ...c, id: contractSeq++ }
	contracts.push(contract)
	return contract
}

export const addAssignment = (contractId: number, plate: string, from: string, until: string | null = null) => {
	const a: MockAssignment = {
		id: assignmentSeq++,
		contractId,
		plate,
		originalPlate: plate,
		from,
		until,
		corrections: [],
	}
	assignments.push(a)
	return a
}

const year = today().slice(0, 4)
const ROUTE_SEED: [string, string, string, number, boolean][] = [
	["N-6", "Вокзал — Пример-бозор", "ООО «Пример-Транс»", 6, true],
	["N-15", "Микрорайон — Пример-бозор", "ООО «Образец-Авто»", 5, true],
	["ЖТ-45", "Посёлок — Центр", "ЧП «Тестовый перевозчик»", 4, true],
	["МТ-25", "Аэропорт — Рынок", "ООО «Демо-Лайн»", 3, true],
	["N-9", "Пример-маршрут", "ООО «Старый договор»", 4, false],
]

for (const [number, name, carrier, quota, current] of ROUTE_SEED) {
	const route = addRoute(number, name)
	const contract = addContract({
		routeId: route.id,
		carrier,
		validFrom: current ? `${year}-01-01` : `${Number(year) - 1}-01-01`,
		validUntil: current ? `${year}-12-31` : shiftDate(today(), -3),
		quota,
	})
	const count = number === "N-6" ? quota + 1 : quota - (number === "МТ-25" ? 1 : 0)
	for (let i = 0; i < count; i++) addAssignment(contract.id, makePlate(), FIRST_IMPORT_DATE)
}
// A contract that starts next year: the "future" state of a contract.
addContract({
	routeId: 1,
	carrier: "ООО «Пример-Транс»",
	validFrom: `${Number(year) + 1}-01-01`,
	validUntil: `${Number(year) + 1}-12-31`,
	quota: 8,
})
// One assignment closed a few days ago, one closing in the future, one corrected.
assignments[1].until = shiftDate(today(), -5)
assignments[3].until = shiftDate(today(), 7)
{
	const corrected = assignments[6]
	const previous = corrected.plate
	corrected.originalPlate = `${previous.slice(0, 7)}${previous[7] === "A" ? "B" : "A"}`
	corrected.corrections.push({
		corrected_at: dayjs().subtract(3, "day").toISOString(),
		corrected_by: "Иванов И. И.",
		previous_plate: corrected.originalPlate,
		recomputed_visits_count: 4,
		reason: "опечатка при вводе",
	})
}

export const contractById = (id: number) => contracts.find((c) => c.id === id)
export const routeById = (id: number) => routes.find((r) => r.id === id)

/** The contract of a route current on `date`: covering it, latest `valid_from`, then highest id (§7.3). */
export const currentContract = (routeId: number, date: string) =>
	contracts
		.filter((c) => c.routeId === routeId && c.validFrom <= date && date <= c.validUntil)
		.sort((a, b) => b.validFrom.localeCompare(a.validFrom) || b.id - a.id)[0]

/** Assignment applies on `date`: from inclusive, until EXCLUSIVE. */
export const appliesOn = (a: MockAssignment, date: string) => a.from <= date && (a.until === null || date < a.until)

// ---- Visits -------------------------------------------------------------------

export interface MockVisit {
	id: number
	plate: string
	at: string
	frames: number
}

export const visits: MockVisit[] = []
let visitSeq = 5000

const addVisit = (plate: string, day: string, minuteOfDay: number) => {
	const at = dayjs.tz(`${day} 00:00`, TIMEZONE).add(minuteOfDay, "minute")
	if (at.isAfter(dayjs())) return
	visits.push({ id: visitSeq++, plate, at: at.toISOString(), frames: int(1, 4) })
}

const registryPlates = assignments.map((a) => a.plate)
const candidatePlates = Array.from({ length: 9 }, makePlate)
const casualPlates = Array.from({ length: 260 }, makePlate)

for (let d = VIEW_WINDOW_DAYS - 1; d >= 0; d--) {
	const day = shiftDate(today(), -d)
	for (const plate of registryPlates) {
		if (rand() < 0.75) for (let i = int(1, 4); i > 0; i--) addVisit(plate, day, int(360, 1200))
	}
	for (const plate of candidatePlates) {
		// Route-like: many visits on most days.
		if (rand() < 0.7) for (let i = int(5, 9); i > 0; i--) addVisit(plate, day, int(360, 1200))
	}
	for (const plate of casualPlates) {
		if (rand() < 0.12) for (let i = int(1, 2); i > 0; i--) addVisit(plate, day, int(420, 1140))
	}
}
visits.sort((a, b) => a.at.localeCompare(b.at))

export const visitDay = (v: MockVisit) => dayjs(v.at).tz(TIMEZONE).format("YYYY-MM-DD")

// ---- Verdicts -----------------------------------------------------------------

export interface Verdict {
	status: Schemas["PassStatus"]
	expiredReason: Schemas["ExpiredReason"] | null
	assignment?: MockAssignment
	contract?: MockContract
}

/** §3.1: by the registry at the moment of the visit. */
export const verdictOf = (plate: string, day: string): Verdict => {
	const started = assignments
		.filter((a) => a.plate === plate && a.from <= day && !(a.until !== null && a.until <= a.from))
		.sort((a, b) => b.from.localeCompare(a.from))
	if (!started.length) return { status: "not_in_registry", expiredReason: null }
	const active = started.find((a) => appliesOn(a, day))
	if (active) {
		const contract = contractById(active.contractId)!
		const valid = contract.validFrom <= day && day <= contract.validUntil
		return valid
			? { status: "permitted", expiredReason: null, assignment: active, contract }
			: { status: "expired", expiredReason: "contract_expired", assignment: active, contract }
	}
	const last = started[0]
	return {
		status: "expired",
		expiredReason: "assignment_closed",
		assignment: last,
		contract: contractById(last.contractId),
	}
}

// ---- Candidates ---------------------------------------------------------------

export interface CandidateCalc {
	plate: string
	days: { date: string; visits_count: number; qualifies: boolean }[]
	qualifyingDays: number
	totalVisits: number
	lastPassOnDate: MockVisit | undefined
}

/** §5.1, §6: window [date − 29 … date] ∩ view window, only maintained days, K days with ≥ N visits. */
export const candidatesFor = (date: string, minDays: number, minVisits: number): CandidateCalc[] => {
	const from = [shiftDate(date, -29), windowStart(), FIRST_IMPORT_DATE].sort().at(-1)!
	const perPlate = new Map<string, Map<string, MockVisit[]>>()
	for (const v of visits) {
		const day = visitDay(v)
		if (day < from || day > date) continue
		if (verdictOf(v.plate, day).status !== "not_in_registry") continue
		const days = perPlate.get(v.plate) ?? new Map<string, MockVisit[]>()
		days.set(day, [...(days.get(day) ?? []), v])
		perPlate.set(v.plate, days)
	}
	const result: CandidateCalc[] = []
	for (const [plate, days] of perPlate) {
		const list = [...days.entries()].map(([d, vs]) => ({
			date: d,
			visits_count: vs.length,
			qualifies: vs.length >= minVisits,
		}))
		const qualifyingDays = list.filter((d) => d.qualifies).length
		if (qualifyingDays < minDays) continue
		result.push({
			plate,
			days: list.sort((a, b) => b.date.localeCompare(a.date)),
			qualifyingDays,
			totalVisits: list.reduce((s, d) => s + d.visits_count, 0),
			lastPassOnDate: days.get(date)?.at(-1),
		})
	}
	return result.sort((a, b) => b.qualifyingDays - a.qualifyingDays || b.totalVisits - a.totalVisits)
}

/** Visits on `date` of non-registry plates that are not candidates (A10). */
export const othersOn = (date: string, candidatePlatesSet: Set<string>): Schemas["Others"] => {
	const plates = new Set<string>()
	let count = 0
	for (const v of visits) {
		if (visitDay(v) !== date || candidatePlatesSet.has(v.plate)) continue
		if (verdictOf(v.plate, date).status !== "not_in_registry") continue
		plates.add(v.plate)
		count++
	}
	return { plates_count: plates.size, visits_count: count }
}

export const registryState = (date: string): Schemas["RegistryState"] =>
	date >= FIRST_IMPORT_DATE ? "maintained" : "not_maintained"
