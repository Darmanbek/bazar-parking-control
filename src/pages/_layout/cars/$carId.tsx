import { createFileRoute } from "@tanstack/react-router"
import { CarPage } from "src/features/car"

export const Route = createFileRoute("/_layout/cars/$carId")({
	component: CarPage,
})
