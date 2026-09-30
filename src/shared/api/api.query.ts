// Typed data layer. `$api` wraps openapi-react-query so that error/success
// toasts, cache invalidation and post-mutation navigation are handled once,
// here, and configured per call through `meta`. useQuery/useMutation are HOOKS
// so they can read antd's <App> context, i18next and the router directly.
//
// Usage:
//   $api.useQuery("get", "/api/v1/cars", { params: { query } })
//   $api.useMutation("post", "/api/v1/auth/login", { meta: { silent: true } })

import { useEffect, useRef } from "react"
import type { ReactNode } from "react"
import { useQueryClient } from "@tanstack/react-query"
import type { QueryClient, QueryKey } from "@tanstack/react-query"
import { useRouter } from "@tanstack/react-router"
import createQueryClient from "openapi-react-query"
import { useTranslation } from "react-i18next"
import { getErrorMessage } from "src/shared/lib/notify.ts"
// Imported by file path, not through the `src/shared/hooks` barrel: a hook there
// that calls $api would close a shared/api -> shared/hooks -> shared/api cycle.
import { useMessage } from "src/shared/hooks/use-message.ts"
import { client } from "./api.client.ts"

/** Toast text for `meta`. `message` is the heading; antd v6 calls it `title`,
 *  which toProps() maps it to. */
export type NotifyMessage = {
	message?: ReactNode
	description?: ReactNode
}

const toProps = ({ message, description }: NotifyMessage = {}) => ({
	...(message === undefined ? {} : { title: message }),
	...(description === undefined ? {} : { description }),
})

type RedirectMeta = {
	to: string
	replace?: boolean
}

/** Per-query behaviour. */
export interface QueryMetaConfig {
	/** Suppress the error toast. */
	silent?: boolean
	/** Override the error toast text. */
	error?: NotifyMessage
	/** Extra side effect on error (e.g. logout). */
	onError?: () => void
	/** Navigate on error. */
	errorRedirect?: RedirectMeta
}

/** Per-mutation behaviour. `onSuccess` / `onError` are the plain react-query
 *  options, passed at the top level; the wrapper awaits `onSuccess`. */
export interface MutationMetaConfig {
	/** Suppress the error toast. */
	silent?: boolean
	/** Show a success toast: `{}` for the default text. */
	success?: NotifyMessage
	/** Override the error toast text. */
	error?: NotifyMessage
	/** Query key(s) to invalidate after success. */
	invalidate?: QueryKey | QueryKey[]
	/** Navigate after success. */
	redirect?: RedirectMeta
	/** Manual cache work after success. */
	onSuccessQueryClient?: (queryClient: QueryClient, data: unknown) => void
}

declare module "@tanstack/react-query" {
	interface Register {
		queryMeta: QueryMetaConfig
		mutationMeta: MutationMetaConfig
	}
}

const raw = createQueryClient(client)

// A single key is ["get", "/api/v1/cars", init]; a list of keys is an array of
// those. Only a list has an array as its first element.
const isKeyList = (invalidate: QueryKey | QueryKey[]): invalidate is QueryKey[] => Array.isArray(invalidate[0])

const useQuery = ((method, url, ...rest) => {
	const [init, options, queryClient] = rest as [unknown, Record<string, unknown>?, QueryClient?]
	const { message } = useMessage()
	const { t } = useTranslation()
	const router = useRouter()
	const meta = (options?.meta ?? {}) as QueryMetaConfig

	// No `placeholderData` default: `keepPreviousData` clears `isPending`, so a
	// detail screen would render the PREVIOUS record while the new one loads.
	// Paginated lists opt in at the call site (4th argument).
	const query = raw.useQuery(method, url, init as never, options as never, queryClient)

	// The toast fires from an effect, NOT from `throwOnError` (evaluated in the
	// render body, so it would re-fire on every render while in error). The ref,
	// seeded from the mount-time stamp, makes this instance toast once per error
	// event it witnesses — StrictMode double effects and an already-errored cache
	// entry included. The stable `key` collapses several observers of one
	// endpoint into one card instead of stacking them.
	const { isError, error, errorUpdatedAt } = query
	const handledErrorAt = useRef(errorUpdatedAt)
	useEffect(() => {
		if (!isError || errorUpdatedAt === handledErrorAt.current) return
		handledErrorAt.current = errorUpdatedAt
		if (!meta.silent) {
			message.error({
				key: `${String(method)}:${String(url)}`,
				title: t("state.error"),
				description: getErrorMessage(error, t("state.error")),
				...toProps(meta.error),
			})
		}
		meta.onError?.()
		if (meta.errorRedirect) router.navigate(meta.errorRedirect as never)
		// `meta` is a fresh object each render; the error event is what we react to.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isError, errorUpdatedAt])

	return query
}) as typeof raw.useQuery

const useMutation = ((method, url, options, queryClient) => {
	const opts = options as Record<string, unknown> | undefined
	const { message } = useMessage()
	const { t } = useTranslation()
	const router = useRouter()
	const qc = useQueryClient()
	const meta = (opts?.meta ?? {}) as MutationMetaConfig
	const userOnSuccess = opts?.onSuccess as ((data: unknown, ...a: unknown[]) => unknown) | undefined
	const userOnError = opts?.onError as ((error: unknown, ...a: unknown[]) => unknown) | undefined

	return raw.useMutation(
		method,
		url,
		{
			...(opts as object),
			onSuccess: async (data: unknown, ...args: unknown[]) => {
				if (meta.success) {
					message.success({ title: t("common.saved"), ...toProps(meta.success) })
				}
				// Two passes, a division of labour: (1) the declared keys, mark-only;
				// (2) the unfiltered net that actually refetches the active queries.
				// Both refetching would abort and repeat every request. Fire and
				// forget — awaiting would hold `isPending` for another round trip.
				if (meta.invalidate) {
					const list = isKeyList(meta.invalidate) ? meta.invalidate : [meta.invalidate]
					for (const queryKey of list) void qc.invalidateQueries({ queryKey, refetchType: "none" })
				}
				void qc.invalidateQueries()
				meta.onSuccessQueryClient?.(qc, data)
				await userOnSuccess?.(data, ...args)
				if (meta.redirect) router.navigate(meta.redirect as never)
			},
			onError: (error: unknown, ...args: unknown[]) => {
				userOnError?.(error, ...args)
				if (meta.silent) return
				message.error({
					title: t("state.error"),
					description: getErrorMessage(error, t("state.error")),
					...toProps(meta.error),
				})
			},
		} as never,
		queryClient
	)
}) as typeof raw.useMutation

export const $api = {
	useQuery,
	useMutation,
	useSuspenseQuery: raw.useSuspenseQuery,
	useInfiniteQuery: raw.useInfiniteQuery,
	queryOptions: raw.queryOptions,
}
