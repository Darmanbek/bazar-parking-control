// Short access to the generated backend types. Always prefer these over
// hand-written request/response shapes: a backend change then surfaces as a TS
// error at the call site instead of silently drifting.

import type { components } from "./schema"

export type { components, operations, paths } from "./schema"

export type Schemas = components["schemas"]
export type Schema<K extends keyof Schemas> = Schemas[K]
