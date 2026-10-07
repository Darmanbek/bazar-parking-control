// Interface languages. The API answers in the same set (§5.2: uz, ru, kaa, en);
// the panel ships uz and ru. `uz` is Uzbek in Latin script, as the TZ's
// status labels are.

export type Lang = "uz" | "ru"

export const LANGS: Lang[] = ["uz", "ru"]

export const DEFAULT_LANG: Lang = "ru"

/** Language names in the switch menu, each in its own language. */
export const LANG_LABELS: Record<Lang, string> = {
	uz: "O'zbekcha",
	ru: "Русский",
}

/** On the switch button. */
export const LANG_SHORT: Record<Lang, string> = {
	uz: "UZ",
	ru: "RU",
}

/** Where the chosen language is kept: a UI setting, not session data. */
export const LANG_STORAGE_KEY = "bazar-avto-lang"

export const isLang = (value: unknown): value is Lang => LANGS.includes(value as Lang)
