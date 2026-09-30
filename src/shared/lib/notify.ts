// Error-body reader for the $api wrapper. The toast surface itself lives in
// shared/hooks/use-message.ts.

/** Pull a human-readable message out of an openapi-fetch error body (FastAPI
 *  shape: `detail` string or `detail[0].msg`, or a plain `message`) or a thrown
 *  Error. */
export const getErrorMessage = (error: unknown, fallback: string): string => {
	if (typeof error === "string") return error
	if (error && typeof error === "object") {
		const body = error as { detail?: unknown; message?: unknown }
		if (typeof body.detail === "string" && body.detail) return body.detail
		if (Array.isArray(body.detail)) {
			const first = body.detail[0] as { msg?: unknown } | undefined
			if (typeof first?.msg === "string") return first.msg
		}
		if (typeof body.message === "string" && body.message) return body.message
	}
	if (error instanceof Error && error.message) return error.message
	return fallback
}
