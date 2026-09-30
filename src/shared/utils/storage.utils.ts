// Persistent client storage. The bearer token lives in localStorage; the
// fetch middleware reads it synchronously on every request.

export const TOKEN_KEY = "bazar-avto-token"

export const tokenStorage = {
	get: (): string | undefined => localStorage.getItem(TOKEN_KEY) ?? undefined,
	set: (token: string): void => {
		localStorage.setItem(TOKEN_KEY, token)
	},
	remove: (): void => {
		localStorage.removeItem(TOKEN_KEY)
	},
}
