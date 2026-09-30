// i18next is configured here, once, as a side effect of main.tsx. Lower layers
// never import this module — they reach the singleton through react-i18next.
// Only Russian for now; a new language is one more file in ./locales.

import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import { resources } from "./resources.ts"

void i18n.use(initReactI18next).init({
	resources,
	lng: "ru",
	fallbackLng: "ru",
	returnObjects: true,
	interpolation: { escapeValue: false },
})

export default i18n
