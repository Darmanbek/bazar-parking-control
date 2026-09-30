// URL state. One schema for the whole app, declared here and installed as the
// root route's `validateSearch` (src/pages/__root.tsx), so
// `useSearch({ strict: false })` returns these fields already typed.
//
// Filters and pagination live in the URL so they survive a reload and a
// filtered list stays shareable as a link.
//
//   setFilter  — anything that changes WHICH rows the list returns. Resets page.
//   setParams  — everything else (the page itself).

import { useNavigate, useSearch } from "@tanstack/react-router"
import type { Schemas } from "src/shared/api"

export interface PaginationState {
	current: number
	pageSize: number
}

export type RootSearch = {
	page?: number
	page_size?: number
	/** Free-text plate search. */
	search?: string
	status?: Schemas["LicenseStatus"]
	/** Date window as the API takes it (YYYY-MM-DD), written as a pair. */
	date_from?: string
	date_to?: string
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

	/** Set filter(s) and return to page 1 — page N of the previous result set is
	 *  usually empty in the new one. */
	const setFilters = (values: Partial<RootSearch>): void => setParams({ ...values, page: undefined })

	const setFilter = <K extends keyof RootSearch>(key: K, value: RootSearch[K]): void =>
		setFilters({ [key]: value } as Partial<RootSearch>)

	return { search, setParams, setFilter, setFilters }
}

/** Table pagination held in the URL. Default for lists. */
export const useUrlPagination = (initial: PaginationState = { current: 1, pageSize: 10 }) => {
	const { search, setParams } = useSearchParams()

	return {
		current: search.page ?? initial.current,
		pageSize: search.page_size ?? initial.pageSize,
		onChange: (current: number, pageSize: number) => setParams({ page: current, page_size: pageSize }),
	}
}
