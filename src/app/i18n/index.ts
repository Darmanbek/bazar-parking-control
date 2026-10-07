// i18next is configured here, once, as a side effect of main.tsx. Lower layers
// never import this module — they reach the singleton through react-i18next
// (or `i18next` itself, e.g. the API client's Accept-Language).
//
// The chosen language is a UI setting: kept in localStorage, restored on load,
// mirrored onto <html lang> and the tab title.

import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import { DEFAULT_LANG, isLang, LANG_STORAGE_KEY } from "src/shared/config"
import { resources } from "./resources.ts"

const saved = localStorage.getItem(LANG_STORAGE_KEY)

void i18n.use(initReactI18next).init({
	resources,
	lng: isLang(saved) ? saved : DEFAULT_LANG,
	fallbackLng: DEFAULT_LANG,
	returnObjects: true,
	interpolation: { escapeValue: false },
})

const syncDocument = () => {
	document.documentElement.lang = i18n.language
	document.title = i18n.t("app.title")
}
syncDocument()

i18n.on("languageChanged", (lng) => {
	localStorage.setItem(LANG_STORAGE_KEY, lng)
	syncDocument()
})

export default i18n
