import { createFileRoute } from "@tanstack/react-router"
import { DayPage } from "src/features/day"

export const Route = createFileRoute("/_layout/")({
	component: DayPage,
})
