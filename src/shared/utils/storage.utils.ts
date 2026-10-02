// What the panel keeps in the browser: the token, its expiry and UI settings —
// never API responses or snapshots (§5.5, H5).

const TOKEN_KEY = "bazar-avto-token"
const TOKEN_EXPIRES_KEY = "bazar-avto-token-expires"
/** Why the last session ended (`account_expired`, …), shown once on the login screen. */
const LOGOUT_REASON_KEY = "bazar-avto-logout-reason"

export const tokenStorage = {
	get: (): string | undefined => localStorage.getItem(TOKEN_KEY) ?? undefined,
	/** `expiresAt` comes from the login response; the lifetime is never hard-coded (§4.1). */
	set: (token: string, expiresAt: string): void => {
		localStorage.setItem(TOKEN_KEY, token)
		localStorage.setItem(TOKEN_EXPIRES_KEY, expiresAt)
	},
	remove: (): void => {
		localStorage.removeItem(TOKEN_KEY)
		localStorage.removeItem(TOKEN_EXPIRES_KEY)
	},
	/** A token past its `expires_at` is not worth a request that can only 401. */
	isValid: (): boolean => {
		const token = localStorage.getItem(TOKEN_KEY)
		const expires = Date.parse(localStorage.getItem(TOKEN_EXPIRES_KEY) ?? "")
		return Boolean(token) && Number.isFinite(expires) && expires > Date.now()
	},
}

export const logoutReason = {
	set: (code: string): void => sessionStorage.setItem(LOGOUT_REASON_KEY, code),
	/** Read once: the reason belongs to the sign-out that just happened. */
	take: (): string | undefined => {
		const code = sessionStorage.getItem(LOGOUT_REASON_KEY) ?? undefined
		sessionStorage.removeItem(LOGOUT_REASON_KEY)
		return code
	},
}
