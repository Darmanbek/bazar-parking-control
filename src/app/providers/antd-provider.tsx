import { App as AntdApp, ConfigProvider, theme } from "antd"
import type { ThemeConfig } from "antd"
import type { AliasToken } from "antd/es/theme/interface"
import ruRU from "antd/locale/ru_RU"
import { useEffect } from "react"
import type { FC, ReactNode } from "react"
import { useThemeStore } from "src/shared/store"

const FONT = "'Onest Variable', system-ui, 'Segoe UI', Roboto, sans-serif"

/* "Asphalt & signal": a graphite shell for the operator's screen, one amber
 * signal colour for what is active, and the two status colours (green/red)
 * kept for licence status alone so they never mean anything else. */
const LIGHT_TOKEN: Partial<AliasToken> = {
	colorPrimary: "#1c2330",
	colorInfo: "#1c2330",
	colorLink: "#9a5b00",
	colorLinkHover: "#c27803",
	colorBgLayout: "#f3f2ee",
	colorBgContainer: "#ffffff",
	colorBgElevated: "#ffffff",
	colorTextHeading: "#14181f",
	colorText: "#1f2530",
	colorBorderSecondary: "rgba(20,24,31,0.08)",
}

const DARK_TOKEN: Partial<AliasToken> = {
	colorPrimary: "#f2b544",
	colorInfo: "#f2b544",
	colorTextLightSolid: "#15181e",
	colorLink: "#f2b544",
	colorLinkHover: "#f7cb76",
	colorBgLayout: "#0f1217",
	colorBgContainer: "#171b22",
	colorBgElevated: "#1f242d",
	colorTextHeading: "#f3f4f6",
	colorText: "#e6e8ec",
	colorBorder: "rgba(255,255,255,0.14)",
	colorBorderSecondary: "rgba(255,255,255,0.07)",
}

const buildTheme = (isDark: boolean): ThemeConfig => ({
	algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
	token: {
		borderRadius: 10,
		borderRadiusLG: 14,
		fontFamily: FONT,
		fontSize: 14,
		controlHeight: 38,
		colorSuccess: "#16a34a",
		colorError: "#dc2626",
		...(isDark ? DARK_TOKEN : LIGHT_TOKEN),
	},
	components: {
		Layout: {
			headerBg: isDark ? "rgba(15,18,23,0.86)" : "#1c2330",
			headerHeight: 64,
			headerPadding: "0 20px",
			bodyBg: isDark ? DARK_TOKEN.colorBgLayout : LIGHT_TOKEN.colorBgLayout,
		},
		Table: {
			headerBg: isDark ? "rgba(255,255,255,0.03)" : "#f7f6f2",
			headerColor: isDark ? "rgba(230,232,236,0.6)" : "#5b6270",
			rowHoverBg: isDark ? "rgba(242,181,68,0.06)" : "#fbf7ee",
			cellPaddingBlock: 10,
		},
		// The header menu sits on graphite in both themes; its colours are set
		// outright rather than derived (dark mode's colorTextLightSolid is dark).
		Menu: {
			darkItemBg: "transparent",
			darkPopupBg: "#1f242d",
			darkItemColor: "rgba(255,255,255,0.72)",
			darkItemHoverColor: "#ffffff",
			darkItemHoverBg: "rgba(255,255,255,0.06)",
			darkItemSelectedBg: "rgba(242,181,68,0.16)",
			darkItemSelectedColor: "#f2b544",
			horizontalItemSelectedColor: "#f2b544",
			itemBorderRadius: 8,
		},
		Button: {
			primaryShadow: "none",
			defaultShadow: "none",
			fontWeight: 600,
		},
		Card: {
			headerHeight: 52,
		},
	},
})

const cardConfig = (isDark: boolean) => ({
	styles: {
		root: {
			border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(20,24,31,0.07)"}`,
			boxShadow: isDark
				? "0 1px 2px rgba(0,0,0,0.3), 0 12px 32px -20px rgba(0,0,0,0.6)"
				: "0 1px 2px rgba(20,24,31,0.04), 0 10px 28px -18px rgba(20,24,31,0.22)",
		},
	},
})

export const AntdProvider: FC<{ children: ReactNode }> = ({ children }) => {
	const mode = useThemeStore((s) => s.mode)
	const isDark = mode === "dark"

	// The only thing the ConfigProvider cannot express: the native colour-scheme
	// hint (scrollbars, autofill) and a hook for the few CSS rules in index.css.
	useEffect(() => {
		document.documentElement.style.colorScheme = mode
		document.documentElement.dataset.theme = mode
	}, [mode])

	return (
		<ConfigProvider
			locale={ruRU}
			theme={buildTheme(isDark)}
			card={cardConfig(isDark)}
		>
			<AntdApp>{children}</AntdApp>
		</ConfigProvider>
	)
}
