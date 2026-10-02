import { createFileRoute } from "@tanstack/react-router"
import { RoutePage } from "src/features/route"

export const Route = createFileRoute("/_layout/registry/$routeId")({
	component: RoutePage,
})
