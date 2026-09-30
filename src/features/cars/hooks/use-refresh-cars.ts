// "Refresh" for the whole dashboard: counters and table together.

import { useIsFetching, useQueryClient } from "@tanstack/react-query"
import { CARS_KEY, CARS_STATS_KEY } from "src/features/cars/data/cars.keys.ts"

export const useRefreshCars = () => {
	const queryClient = useQueryClient()
	const fetching = useIsFetching({ queryKey: CARS_KEY }) + useIsFetching({ queryKey: CARS_STATS_KEY })

	return {
		refresh: () =>
			void Promise.all([
				queryClient.refetchQueries({ queryKey: CARS_KEY, type: "active" }),
				queryClient.refetchQueries({ queryKey: CARS_STATS_KEY, type: "active" }),
			]),
		fetching: fetching > 0,
	}
}
