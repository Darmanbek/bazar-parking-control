import { createRootRoute, Outlet } from "@tanstack/react-router"
import type { RootSearch } from "src/shared/hooks/use-search-params.ts"

// The root only hosts the outlet; the app chrome and the auth gate live in
// `_layout`, and `/login` renders full-screen beside it.
//
// `validateSearch` is declared once, here, so every route inherits one typed
// query schema. TanStack JSON-parses search values, so `?search=123` arrives as
// a number and `?page=abc` as a string: both are normalised to what RootSearch
// promises, and an unusable page number is dropped so the default applies.
const toPage = (value: unknown): number | undefined => {
	const parsed = Number(value)
	return value && Number.isFinite(parsed) && parsed > 0 ? parsed : undefined
}

const toStatus = (value: unknown): RootSearch["status"] =>
	value === "licensed" || value === "unlicensed" ? value : undefined

const toDate = (value: unknown): string | undefined =>
	typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : undefined

export const Route = createRootRoute({
	component: () => <Outlet />,
	validateSearch: (search: Record<string, unknown>): RootSearch => ({
		page: toPage(search.page),
		page_size: toPage(search.page_size),
		search: search.search === undefined || search.search === "" ? undefined : String(search.search),
		status: toStatus(search.status),
		date_from: toDate(search.date_from),
		date_to: toDate(search.date_to),
	}),
})
