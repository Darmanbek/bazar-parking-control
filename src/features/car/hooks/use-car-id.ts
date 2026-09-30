import { useParams } from "@tanstack/react-router"

/** The car in the URL, as the integer the API path expects. */
export const useCarId = (): number => {
	const { carId } = useParams({ from: "/_layout/cars/$carId" })
	return Number(carId)
}
