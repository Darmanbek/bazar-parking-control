// Opening a car from the dashboard carries the chosen period along, so its
// history shows the same days the guard was looking at. Page, search and
// status belong to the dashboard's table and stay behind.

import { useNavigate } from "@tanstack/react-router"
import type { RootSearch } from "src/shared/hooks"

export const carSearch = (prev: RootSearch): RootSearch => ({ date_from: prev.date_from, date_to: prev.date_to })

export const useOpenCar = () => {
	const navigate = useNavigate()
	return (carId: number) => void navigate({ to: "/cars/$carId", params: { carId: String(carId) }, search: carSearch })
}
