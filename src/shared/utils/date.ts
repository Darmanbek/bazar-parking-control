// Dates as the contract has them (§3.5, §5.2): calendar days are Asia/Tashkent
// `Y-m-d` strings, moments are UTC ISO strings shown in Tashkent time. The
// dayjs utc/timezone plugins are installed once, in app (src/app/dayjs.ts).

import dayjs from "dayjs"
import type {} from "dayjs/plugin/timezone"
import type {} from "dayjs/plugin/utc"
import { TIMEZONE } from "src/shared/config"

export const API_DATE_FORMAT = "YYYY-MM-DD"
export const DATE_FORMAT = "DD.MM.YYYY"

/** Today as a Tashkent calendar day — not the browser's day. */
export const tashkentToday = (): string => dayjs().tz(TIMEZONE).format(API_DATE_FORMAT)

/** `date` ± `days`, as a calendar-day string. */
export const shiftDate = (date: string, days: number): string => dayjs(date).add(days, "day").format(API_DATE_FORMAT)

/** A calendar day (`Y-m-d`) for people: `30.12.2026`. */
export const formatDate = (value: string | null | undefined): string => {
	if (!value) return "—"
	const parsed = dayjs(value)
	return parsed.isValid() ? parsed.format(DATE_FORMAT) : "—"
}

/** A UTC moment, shown in Tashkent time. */
export const formatDateTime = (value: string | null | undefined): string => {
	if (!value) return "—"
	const parsed = dayjs(value)
	return parsed.isValid() ? parsed.tz(TIMEZONE).format(`${DATE_FORMAT}, HH:mm`) : "—"
}

export const formatTime = (value: string | null | undefined): string => {
	if (!value) return "—"
	const parsed = dayjs(value)
	return parsed.isValid() ? parsed.tz(TIMEZONE).format("HH:mm:ss") : "—"
}

/**
 * The last day an assignment applies. Its `until` is EXCLUSIVE — the first day
 * it no longer applies (§3.5) — so people are shown `until − 1` "inclusive", to
 * keep it apart from a contract's inclusive `valid_until`.
 */
export const assignmentLastDay = (until: string): string => shiftDate(until, -1)
