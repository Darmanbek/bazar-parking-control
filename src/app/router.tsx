import { createRouter } from "@tanstack/react-router"
import { routeTree } from "src/page-tree.gen.ts"
import { ErrorBoundary, Loader, NotFound } from "src/widgets/router-boundary"

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
