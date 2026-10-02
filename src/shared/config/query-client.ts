import { QueryClient } from "@tanstack/react-query"

// Toasts and invalidation live in the $api wrapper (shared/api/api.query.ts);
// this file only holds the client and its defaults.
//
// `retry: false` on purpose: every GET is written to the audit log (§5.4) and a
// `503 audit_unavailable` must not be retried in a loop. A failed read shows its
// error; the user retries by hand. The cache is memory only (§5.5).
export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false,
			refetchOnMount: true,
			staleTime: 1000 * 60 * 5,
			retry: false,
		},
		mutations: {
			retry: false,
		},
	},
})
