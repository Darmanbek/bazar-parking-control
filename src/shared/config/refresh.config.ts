// How often the live screens poll the backend. The parking lot changes by the
// minute, so the dashboard re-reads itself instead of waiting for a click.

export const REFRESH_INTERVALS = [5_000, 10_000, 30_000, 60_000] as const

export type RefreshInterval = (typeof REFRESH_INTERVALS)[number]

export const DEFAULT_REFRESH_INTERVAL: RefreshInterval = 10_000
