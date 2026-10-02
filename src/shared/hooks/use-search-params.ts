// URL state. One schema for the whole app, declared here and installed as the
// root route's `validateSearch` (src/pages/__root.tsx), so
// `useSearch({ strict: false })` returns these fields already typed.
//
// Filters and pagination live in the URL so a view survives a reload and can be
// shared as a link. No API response is ever put here.
//
//   setFilter / setFilters — anything that changes WHICH rows a list returns. Resets the page.
//   setParams              — everything else (the page itself).

import { useNavigate, useSearch } from "@tanstack/react-router"
import { DEFAULT_PER_PAGE } from "src/shared/config"

export interface PaginationState {
	current: number
	pageSize: number
}

export type RootSearch = {
	page?: number
	per_page?: number
	/** A Tashkent calendar day, `Y-m-d`. Absent = the screen's default day. */
	date?: string
	/** Passes filter: the API takes only these two (§7.8). */
	status?: "permitted" | "expired"
	/** Candidate thresholds as requested; the applied ones come back in meta.thresholds. */
	min_days?: number
	min_visits?: number
	/** On-screen plate / route filter. Never sent to the API. */
	q?: string
	/** The import preview being looked at. */
	import_id?: number
}

export const useSearchParams = () => {
	const search = useSearch({ strict: false })
	const navigate = useNavigate()

	const setParams = (values: Partial<RootSearch>): void => {
		navigate({
			to: ".",
			search: (prev) => ({ ...prev, ...values }),
			resetScroll: false,
			replace: true,
		})
	}

	const setFilters = (values: Partial<RootSearch>): void => setParams({ ...values, page: undefined })

	const setFilter = <K extends keyof RootSearch>(key: K, value: RootSearch[K]): void =>
		setFilters({ [key]: value } as Partial<RootSearch>)

	return { search, setParams, setFilter, setFilters }
}

/** Table pagination held in the URL. Default for lists. */
export const useUrlPagination = (initial: PaginationState = { current: 1, pageSize: DEFAULT_PER_PAGE }) => {
	const { search, setParams } = useSearchParams()

	return {
		current: search.page ?? initial.current,
		pageSize: search.per_page ?? initial.pageSize,
		onChange: (current: number, pageSize: number) => setParams({ page: current, per_page: pageSize }),
	}
}
