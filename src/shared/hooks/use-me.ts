// The signed-in inspector: name, market scope, registry start and the server's
// limits (§7.1). Read once per session — every GET is an audited read (§5.4) —
// and shared by every screen through the query cache.

import { $api } from "src/shared/api"

export const ME_KEY = ["get", "/me"]

export const useMe = () => $api.useQuery("get", "/me", {}, { staleTime: Infinity, select: (r) => r.data })
