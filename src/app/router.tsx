import { createRouter } from "@tanstack/react-router"
import { routeTree } from "src/page-tree.gen.ts"
import { ErrorBoundary, Loader, NotFound } from "src/widgets/router-boundary"

// Browser history: a deep link like /candidates is answered with index.html by
// the SPA fallback in vercel.json. That rule only serves the static page — it
// never proxies the API, which the browser calls directly (H2).
export const router = createRouter({
	routeTree,
	defaultPreload: "intent",
	defaultPendingComponent: Loader,
	defaultNotFoundComponent: NotFound,
	defaultErrorComponent: ErrorBoundary,
})

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router
	}
}
