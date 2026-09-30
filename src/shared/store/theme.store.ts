// Light / dark theme toggle. Feeds antd's ConfigProvider in app/providers.

import { create } from "zustand"
import { persist } from "zustand/middleware"

export type ThemeMode = "light" | "dark"

interface ThemeState {
	mode: ThemeMode
	toggle: () => void
}

export const useThemeStore = create<ThemeState>()(
	persist(
		(set) => ({
			mode: "light",
			toggle: () => set((s) => ({ mode: s.mode === "light" ? "dark" : "light" })),
		}),
		{ name: "bazar-avto-theme" }
	)
)
