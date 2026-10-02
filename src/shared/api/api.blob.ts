// Binary answers — snapshots and xlsx exports. `Authorization` cannot ride on
// `<img src>` or `<a href>`, so both are fetched with the token and read as a
// Blob (§5.5). Nothing here caches: each open is an audited read (A16).

import { client } from "./api.client.ts"
import type { paths } from "./schema"

type BlobPath = "/passes/{id}/image" | "/exports/passes" | "/exports/candidates"

type BlobParams<P extends BlobPath> = paths[P]["get"]["parameters"]

/** Throws the error body (same shape as any other API error) when not 2xx. */
export const fetchBlob = async <P extends BlobPath>(path: P, params: BlobParams<P>): Promise<Blob> => {
	const { data, error } = await client.GET(path as "/exports/passes", {
		params: params as BlobParams<"/exports/passes">,
		parseAs: "blob",
	})
	if (error !== undefined) throw error
	if (!data) throw new Error("empty")
	return data as unknown as Blob
}
