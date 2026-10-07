import type { ru } from "./ru.ts"

/** The shape of a dictionary: every key of the Russian one, any string values. */
type Shape<T> = {
	[K in keyof T]: T[K] extends string ? string : T[K] extends readonly string[] ? string[] : Shape<T[K]>
}

/** Every other language must cover exactly the keys of `ru` — a missing key is a TS error. */
export type Dictionary = Shape<typeof ru>
