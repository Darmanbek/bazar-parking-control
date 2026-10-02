// Live polling of today's screen. Every read is written to the audit log
// (§5.4), so the floor is one minute.

export const REFRESH_INTERVALS = [60_000, 120_000, 300_000] as const

export type RefreshInterval = (typeof REFRESH_INTERVALS)[number]

export const DEFAULT_REFRESH_INTERVAL: RefreshInterval = 60_000
