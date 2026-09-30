// The dashboard's filter set, read once from the URL. The counters, the table
// and the Excel export all ask with this same object, so the file and the
// screen cannot disagree about what is shown.

import { useDateRange, useSearchParams } from "src/shared/hooks"

export const useCarsFilters = () => {
	const { search } = useSearchParams()
	const { dateFrom, dateTo } = useDateRange()

	return {
		date_from: dateFrom,
		date_to: dateTo,
		search: search.search,
		status: search.status,
	}
}
