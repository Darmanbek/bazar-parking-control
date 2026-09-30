import "i18next"
import type { resources } from "./resources.ts"

declare module "i18next" {
	interface CustomTypeOptions {
		resources: (typeof resources)["ru"]
		returnObjects: true
	}
}
