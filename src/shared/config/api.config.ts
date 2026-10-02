// API location. Read from the build environment, never hard-coded (H8): the
// production build points at https://api.smart-bazar.uz, local development at
// whatever .env says. The browser calls it directly — no proxy (H2).

export const API_BASE_URL = ((import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "").replace(/\/+$/, "")

/** Every path of the contract is relative to this (§7). */
export const API_URL = `${API_BASE_URL}/api/v1/route-control`

/**
 * Answer the API from the MSW mocks (src/app/mocks). Development only: the
 * `import.meta.env.DEV` guard is a build-time constant, so a production build
 * drops the mocks entirely, whatever VITE_USE_MOCKS says.
 */
export const USE_MOCKS = import.meta.env.DEV && import.meta.env.VITE_USE_MOCKS === "true"
