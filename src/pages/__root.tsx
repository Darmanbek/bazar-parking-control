import { createRootRoute, Outlet } from "@tanstack/react-router"
import type { RootSearch } from "src/shared/hooks/use-search-params.ts"

// The root only hosts the outlet; the app chrome and the auth gate live in
// `_layout`, and `/login` renders full-screen beside it.
//
// `validateSearch` is declared once, here, so every route inherits one typed
// query schema. TanStack JSON-parses search values (`?q=123` arrives as a
// number), so each field is normalised to what RootSearch promises and anything
// unusable is dropped so the screen's default applies. Range checks against the
// view window happen on the screens, which know it from GET me.
const toPositiveInt = (value: unknown): number | undefined => {
	const parsed = Number(value)
	return value && Number.isInteger(parsed) && parsed > 0 ? parsed : undefined
}

const toDate = (value: unknown): string | undefined =>
	typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : undefined

const toStatus = (value: unknown): RootSearch["status"] =>
	value === "permitted" || value === "expired" ? value : undefined

export const Route = createRootRoute({
	component: () => <Outlet />,
	validateSearch: (search: Record<string, unknown>): RootSearch => ({
		page: toPositiveInt(search.page),
		per_page: toPositiveInt(search.per_page),
		date: toDate(search.date),
		status: toStatus(search.status),
		min_days: toPositiveInt(search.min_days),
		min_visits: toPositiveInt(search.min_visits),
		q: search.q === undefined || search.q === "" ? undefined : String(search.q),
		import_id: toPositiveInt(search.import_id),
	}),
})
