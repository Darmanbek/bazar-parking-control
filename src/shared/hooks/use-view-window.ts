// The view window (§5.1): `[today − (N − 1) … today]`, N = `limits.view_window_days`
// from GET me (30 today; never hard-coded), days in Asia/Tashkent. Candidates
// exist only for closed days, so their last selectable day is yesterday.

import { FALLBACK_VIEW_WINDOW_DAYS } from "src/shared/config"
import { shiftDate, tashkentToday } from "src/shared/utils"
import { useMe } from "./use-me.ts"

export const useViewWindow = () => {
	const me = useMe()
	const days = me.data?.limits.view_window_days ?? FALLBACK_VIEW_WINDOW_DAYS
	const today = tashkentToday()

	return {
		today,
		yesterday: shiftDate(today, -1),
		/** First day still inside the window. */
		minDate: shiftDate(today, -(days - 1)),
		days,
		/** `date` inside the window (and not after `maxDate`)? */
		contains: (date: string, maxDate = today) => date >= shiftDate(today, -(days - 1)) && date <= maxDate,
	}
}
