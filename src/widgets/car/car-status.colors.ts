import type { Schemas } from "src/shared/api"

/** Green and red mean licensed / unlicensed and nothing else anywhere in the app. */
export const STATUS_COLOR: Record<Schemas["LicenseStatus"], string> = {
	licensed: "#16a34a",
	unlicensed: "#dc2626",
}
