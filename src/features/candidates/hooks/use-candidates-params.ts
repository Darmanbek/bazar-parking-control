// What the candidates screen asks for. Candidates exist only for closed days
// (§5.1): `?date=` is honoured when it is inside the view window and no later
// than yesterday, otherwise the day is yesterday — the API's own default.
// K/N are sent only when the inspector set them; absent, the server applies its
// own floor, and the values actually applied come back in meta.thresholds.

import { useSearchParams, useViewWindow } from "src/shared/hooks"

export const useCandidatesParams = () => {
	const { search } = useSearchParams()
	const window = useViewWindow()

	const date = search.date && window.contains(search.date, window.yesterday) ? search.date : window.yesterday

	return {
		date,
		min_days: search.min_days,
		min_visits: search.min_visits,
	}
}
