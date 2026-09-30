export const BASE_URL = import.meta.env.VITE_API_URL as string

/** Answer the API from the MSW mocks (src/app/mocks) while the backend is not ready. */
export const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === "true"
