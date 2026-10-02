// The day this screen shows: `?date=` when it lies inside the view window,
// today otherwise. Registry passes are live (§5.1), so only today polls — and
// at most once a minute (§5.4); a past day does not change.

import { useSearchParams, useViewWindow } from "src/shared/hooks"
import { useRefetchInterval } from "src/shared/store"

export const useDay = () => {
	const { search } = useSearchParams()
	const window = useViewWindow()
	const interval = useRefetchInterval()

	const date = search.date && window.contains(search.date) ? search.date : window.today
	const isToday = date === window.today

	return {
		date,
		isToday,
		refetchInterval: isToday ? interval : (false as const),
	}
}
