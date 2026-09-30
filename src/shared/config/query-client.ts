import { QueryClient } from "@tanstack/react-query"

// Toasts and invalidation are NOT here — they live in the $api wrapper
// (shared/api/api.query.ts), which can read React context. This file only holds
// the client and its defaults.
//
// `refetchOnMount: true` pairs with the wrapper's unfiltered invalidateQueries():
// with `false`, an invalidated but unmounted query would still serve cache on
// its next mount. Live screens poll through `refetchInterval` at the call site.
export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false,
			refetchOnMount: true,
			staleTime: 1000 * 60 * 60 * 2,
			retry: 1,
			retryDelay: 1000,
		},
	},
})
