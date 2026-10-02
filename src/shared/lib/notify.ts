// Error text for people. Errors are shown by their machine `code` (§5.6) —
// and an upload error by its `reason` — never by matching the server's text.
// The server `message` is the fallback for a code this build does not know.
//
// `i18next` is the singleton app/i18n initialises (a package import, not an
// app dependency).

import i18n from "i18next"

export interface ApiErrorBody {
	/** HTTP status, added by the client (shared/api/api.client.ts). */
	status?: number
	message?: string
	code?: string
	reason?: string
	errors?: Record<string, string[]>
	conflict?: { route_number?: string }
}

const asBody = (error: unknown): ApiErrorBody | undefined =>
	error && typeof error === "object" ? (error as ApiErrorBody) : undefined

/** The translation of `code`, if this build has one. */
export const errorCodeText = (code: string | undefined): string | undefined => {
	if (!code) return undefined
	const key = `errors.${code}`
	return i18n.exists(key) ? String(i18n.t(key as never)) : undefined
}

export const getErrorMessage = (error: unknown, fallback: string): string => {
	if (typeof error === "string") return error
	const body = asBody(error)
	if (body) {
		const byCode = errorCodeText(body.code) ?? errorCodeText(body.reason ? `file_${body.reason}` : undefined)
		const conflict = body.conflict?.route_number
			? ` ${String(i18n.t("errors.conflict_route" as never, { route: body.conflict.route_number } as never))}`
			: ""
		if (byCode) return `${byCode}${conflict}`
		const firstField = body.errors ? Object.values(body.errors).find((v) => v.length)?.[0] : undefined
		if (firstField) return `${firstField}${conflict}`
		if (body.message) return `${body.message}${conflict}`
	}
	if (error instanceof Error && error.message) return error.message
	return fallback
}

/** Field errors of a `422`, in the shape antd's `form.setFields` takes. */
export const fieldErrors = (error: unknown): { name: string; errors: string[] }[] =>
	Object.entries(asBody(error)?.errors ?? {}).map(([name, errors]) => ({ name, errors }))

export const errorCode = (error: unknown): string | undefined => asBody(error)?.code

export const errorStatus = (error: unknown): number | undefined => asBody(error)?.status
