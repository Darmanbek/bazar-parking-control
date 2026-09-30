import createClient, { type Middleware } from "openapi-fetch"
import { BASE_URL } from "src/shared/config"
import { tokenStorage } from "src/shared/utils"
import type { paths } from "./schema"

// The draft schema has no refresh endpoint (only login / me), so a 401 simply
// ends the session: drop the token and go to /login. Never for the login request
// itself — its 401 is "wrong password", which the form reports inline.
let signingOut = false

const authMiddleware: Middleware = {
	onRequest({ request }) {
		const token = tokenStorage.get()
		if (token) request.headers.set("Authorization", `Bearer ${token}`)
		return request
	},
	onResponse({ request, response }) {
		if (response.status !== 401 || request.url.includes("/auth/login")) return response
		if (signingOut) return response
		signingOut = true

		tokenStorage.remove()
		// A full navigation rather than a router push: it takes the in-memory
		// query cache with it.
		if (!window.location.pathname.startsWith("/login")) window.location.assign("/login")
		return response
	},
}

export const client = createClient<paths>({ baseUrl: BASE_URL })
client.use(authMiddleware)
