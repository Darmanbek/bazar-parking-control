import i18n from "i18next"
import createClient, { type Middleware } from "openapi-fetch"
import { API_URL } from "src/shared/config"
import { logoutReason, tokenStorage } from "src/shared/utils"
import type { paths } from "./schema"

// One sign-out per expiry, however many requests were in flight.
let signingOut = false

const LOGIN_PATH = "/login"

// Bearer token + JSON on every request; no cookies (§4.1, H4). The token is
// read at request time, never captured when the client is built.
//
// The contract has no refresh endpoint (only login / logout / me), so any `401`
// ends the session: clear the token, remember WHY (`account_expired`,
// `account_revoked`, `unauthenticated`) and go to the login screen, which shows
// the reason (§5.6). Never for the login request itself — its errors belong to
// the form.
const authMiddleware: Middleware = {
	onRequest({ request }) {
		const token = tokenStorage.get()
		if (token) request.headers.set("Authorization", `Bearer ${token}`)
		request.headers.set("Accept", "application/json")
		// Server texts (e.g. import preview messages) in the interface language
		// (§5.2). `i18next` is the singleton app/i18n initialises — a package import.
		request.headers.set("Accept-Language", i18n.resolvedLanguage ?? i18n.language ?? "ru")
		return request
	},
	async onResponse({ request, response }) {
		if (response.status !== 401 || request.url.endsWith("/auth/login")) return response
		if (signingOut) return response
		signingOut = true

		const body = (await response
			.clone()
			.json()
			.catch(() => ({}))) as { code?: string }
		tokenStorage.remove()
		if (body.code) logoutReason.set(body.code)
		// A full navigation rather than a router push: it drops the in-memory
		// query cache — the only place API answers live.
		if (window.location.pathname !== LOGIN_PATH) window.location.assign(LOGIN_PATH)
		return response
	},
}

// Every error reaches callers as a JSON body that also carries its HTTP
// `status`. Some answers can only be told apart by it: a 404 without a `code`
// is how an import preview says it has gone (§7.3). And nginx / PHP reject an
// oversized upload before the app with a bare `413` (no JSON): it gets the body
// the app would have sent, `reason: "too_large"`, so the import screen keys
// off `reason` alone.
const errorShapeMiddleware: Middleware = {
	async onResponse({ response }) {
		if (response.ok) return response
		const body = (await response
			.clone()
			.json()
			.catch(() => ({}))) as Record<string, unknown>
		const shaped = {
			...body,
			...(response.status === 413 ? { reason: "too_large" } : {}),
			status: response.status,
		}
		return new Response(JSON.stringify(shaped), {
			status: response.status,
			statusText: response.statusText,
			headers: { "Content-Type": "application/json" },
		})
	},
}

export const client = createClient<paths>({ baseUrl: API_URL })
client.use(authMiddleware)
client.use(errorShapeMiddleware)
