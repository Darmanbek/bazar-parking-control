import { createFileRoute } from "@tanstack/react-router"
import { CarsPage } from "src/features/cars"

export const Route = createFileRoute("/_layout/")({
	component: CarsPage,
})
