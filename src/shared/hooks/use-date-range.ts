// The date window a screen reads, from the URL. Absent means the screen's own
// default: the dashboard opens on today (who is on the lot now), a car's page
// on the last 30 days (a car found by search may not have come today).

import dayjs from "dayjs"
import { API_DATE_FORMAT } from "src/shared/utils"
import { useSearchParams } from "./use-search-params.ts"

/** `defaultDays` — length of the default window ending today; 1 = today only. */
export const useDateRange = (defaultDays = 1) => {
	const { search, setFilters } = useSearchParams()
	const today = dayjs()

	const dateTo = search.date_to ?? search.date_from ?? today.format(API_DATE_FORMAT)
	const dateFrom =
		search.date_from ??
		dayjs(dateTo)
			.subtract(defaultDays - 1, "day")
			.format(API_DATE_FORMAT)

	return {
		dateFrom,
		dateTo,
		setRange: (from: string | undefined, to: string | undefined) => setFilters({ date_from: from, date_to: to }),
	}
}
