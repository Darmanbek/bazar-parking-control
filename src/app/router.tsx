import { createHashHistory, createRouter } from "@tanstack/react-router"
import { routeTree } from "src/page-tree.gen.ts"
import { ErrorBoundary, Loader, NotFound } from "src/widgets/router-boundary"

// Hash history: Vercel serves the build as plain static files, and a deep link
// like /candidates would otherwise need a `rewrites` rule — which the hosting
// conditions rule out (H2, checklist §10). With `/#/candidates` the server only
// ever serves index.html.
export const router = createRouter({
	routeTree,
	history: createHashHistory(),
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
