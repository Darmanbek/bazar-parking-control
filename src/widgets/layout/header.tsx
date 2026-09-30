// The operator's top bar: brand, the car finder, and the session controls.
// Graphite in both themes — it is the frame of the screen, not a surface in it.

import { LogoutOutlined, MoonOutlined, SunOutlined, UserOutlined } from "@ant-design/icons"
import { useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { Button, Flex, Layout, Tooltip } from "antd"
import type { FC } from "react"
import { useTranslation } from "react-i18next"
import { $api } from "src/shared/api"
import { useResponsive } from "src/shared/hooks"
import { useThemeStore } from "src/shared/store"
import { Brandmark } from "src/shared/ui"
import { tokenStorage } from "src/shared/utils"
import { CarSearch } from "src/widgets/car"

const ON_DARK = "rgba(255,255,255,0.86)"

export const AppHeader: FC = () => {
	const { t } = useTranslation()
	const navigate = useNavigate()
	const queryClient = useQueryClient()
	const { isMobile, isDesktop } = useResponsive()
	const { mode, toggle } = useThemeStore()
	const me = $api.useQuery("get", "/api/v1/auth/me")

	const logout = () => {
		tokenStorage.remove()
		queryClient.clear()
		void navigate({ to: "/login" })
	}

	return (
		<Layout.Header
			style={{
				position: "sticky",
				top: 0,
				zIndex: 100,
				display: "flex",
				alignItems: "center",
				gap: 16,
				height: "auto",
				minHeight: 64,
				paddingBlock: isMobile ? 10 : 0,
				flexWrap: isMobile ? "wrap" : "nowrap",
				borderBottom: "1px solid rgba(255,255,255,0.06)",
				backdropFilter: "saturate(160%) blur(8px)",
				lineHeight: "normal",
			}}
		>
			<Flex
				align={"center"}
				gap={10}
				style={{ cursor: "pointer", flexShrink: 0 }}
				onClick={() => void navigate({ to: "/" })}
			>
				<Brandmark size={34} />
				{isMobile ? null : (
					<div style={{ lineHeight: 1.15 }}>
						<div style={{ color: "#fff", fontWeight: 800, fontSize: 16, letterSpacing: "-0.01em" }}>
							{t("app.title")}
						</div>
						<div style={{ color: "#f2b544", fontSize: 12, fontWeight: 500 }}>{t("app.subtitle")}</div>
					</div>
				)}
			</Flex>

			<Flex
				justify={"center"}
				style={{ minWidth: 0, order: isMobile ? 3 : 0, flex: isMobile ? "1 1 100%" : 1 }}
			>
				<CarSearch width={isMobile ? "100%" : 380} />
			</Flex>

			<Flex
				align={"center"}
				gap={6}
				style={{ marginLeft: isMobile ? "auto" : 0, flexShrink: 0 }}
			>
				{isDesktop && me.data ? (
					<span style={{ color: ON_DARK, fontSize: 13, marginRight: 8, whiteSpace: "nowrap" }}>
						<UserOutlined style={{ marginRight: 6, color: "#f2b544" }} />
						{me.data.full_name}
					</span>
				) : null}
				<Tooltip title={mode === "light" ? t("common.theme_dark") : t("common.theme_light")}>
					<Button
						type={"text"}
						aria-label={mode === "light" ? t("common.theme_dark") : t("common.theme_light")}
						icon={mode === "light" ? <MoonOutlined /> : <SunOutlined />}
						onClick={toggle}
						style={{ color: ON_DARK }}
					/>
				</Tooltip>
				<Tooltip title={t("common.logout")}>
					<Button
						type={"text"}
						aria-label={t("common.logout")}
						icon={<LogoutOutlined />}
						onClick={logout}
						style={{ color: ON_DARK }}
					/>
				</Tooltip>
			</Flex>
		</Layout.Header>
	)
}
