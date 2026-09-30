// In-memory parking lot for the MSW mocks. Seeded deterministically, then kept
// "live": every few seconds of wall time a car drives in or out, so polling on
// the dashboard visibly moves the numbers — the way the real camera feed will.

import dayjs from "dayjs"
import type { Schemas } from "src/shared/api"
import { BASE_URL } from "src/shared/config"

type LicenseStatus = Schemas["LicenseStatus"]
type Direction = Schemas["Direction"]

export interface MockCar {
	id: number
	number: string
	status: LicenseStatus
}

export interface MockEvent {
	id: number
	carId: number
	detectedAt: string
	direction: Direction
}

// Small seeded PRNG (mulberry32) so a reload shows the same lot.
let seed = 20260930
const rand = (): number => {
	seed |= 0
	seed = (seed + 0x6d2b79f5) | 0
	let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
	t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
	return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}
const int = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min
const pick = <T>(list: readonly T[]): T => list[int(0, list.length - 1)]

const LETTERS = [..."ABCDEFHJKLMNOPRSTUXYZ"]
const REGIONS = ["95", "95", "95", "95", "90", "01", "10", "40"]

const makePlate = (): string => {
	const region = pick(REGIONS)
	const digits = String(int(0, 999)).padStart(3, "0")
	if (rand() < 0.25) return `${region}${digits}${pick(LETTERS)}${pick(LETTERS)}${pick(LETTERS)}`
	return `${region}${pick(LETTERS)}${digits}${pick(LETTERS)}${pick(LETTERS)}`
}

const cars: MockCar[] = []
const events: MockEvent[] = []
const lastDirection = new Map<number, Direction>()
let eventSeq = 1

const addEvent = (carId: number, at: dayjs.Dayjs): void => {
	const direction: Direction = lastDirection.get(carId) === "in" ? "out" : "in"
	lastDirection.set(carId, direction)
	events.push({ id: eventSeq++, carId, detectedAt: at.toISOString(), direction })
}

const seedLot = (): void => {
	const now = dayjs()
	for (let id = 1; id <= 160; id++) {
		cars.push({ id, number: makePlate(), status: rand() < 0.68 ? "licensed" : "unlicensed" })
	}
	const pending: { carId: number; at: dayjs.Dayjs }[] = []
	for (const car of cars) {
		// Regulars (traders) come most days; the rest are occasional customers.
		const regular = car.status === "licensed" && rand() < 0.6
		const days = regular ? int(12, 30) : int(1, 5)
		for (let i = 0; i < days; i++) {
			const day = now.subtract(int(0, 30), "day").startOf("day")
			const arrive = day.add(int(6, 16), "hour").add(int(0, 59), "minute").add(int(0, 59), "second")
			const leave = arrive.add(int(20, 420), "minute")
			pending.push({ carId: car.id, at: arrive })
			pending.push({ carId: car.id, at: leave })
		}
	}
	pending
		.filter((p) => p.at.isBefore(now))
		.sort((a, b) => a.at.valueOf() - b.at.valueOf())
		.forEach((p) => addEvent(p.carId, p.at))
}
seedLot()

let lastTick = Date.now()

/** Advance the lot to "now": roughly one detection per 6 seconds elapsed. */
export const tick = (): void => {
	const due = Math.floor((Date.now() - lastTick) / 6000)
	if (due <= 0) return
	lastTick = Date.now()
	for (let i = 0; i < Math.min(due, 5); i++) {
		let car = pick(cars)
		if (rand() < 0.2) {
			car = { id: cars.length + 1, number: makePlate(), status: rand() < 0.5 ? "licensed" : "unlicensed" }
			cars.push(car)
		}
		addEvent(car.id, dayjs())
	}
}

export const photoUrl = (carId: number, eventId: number): string => `${BASE_URL}/media/cars/${carId}/${eventId}.svg`

export const db = {
	cars,
	events,
	carById: (id: number) => cars.find((c) => c.id === id),
}

/** `[from, to]` as inclusive calendar days; either end may be open. */
export const inWindow = (iso: string, from: string | null, to: string | null): boolean => {
	const day = dayjs(iso).format("YYYY-MM-DD")
	return (!from || day >= from) && (!to || day <= to)
}
