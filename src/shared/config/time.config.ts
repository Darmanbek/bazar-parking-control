/** Every calendar date of the contract is an Asia/Tashkent day (§3.5, §5.2). */
export const TIMEZONE = "Asia/Tashkent"

/** Used until GET me answers; the real value is `limits.view_window_days`. */
export const FALLBACK_VIEW_WINDOW_DAYS = 30

/** Laravel pagination: default 50, at most 200 (§5.2). */
export const DEFAULT_PER_PAGE = 20
export const PER_PAGE_OPTIONS = [20, 50, 100, 200]
