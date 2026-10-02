// The inspector's top bar: brand, the four sections, and the session controls.
// Graphite in both themes — it is the frame of the screen, not a surface in it.

import { LogoutOutlined, MoonOutlined, SunOutlined, UserOutlined } from "@ant-design/icons"
import { useQueryClient } from "@tanstack/react-query"
import { useNavigate, useRouterState } from "@tanstack/react-router"
import { Button, Flex, Layout, Menu, Tooltip } from "antd"
import type { FC } from "react"
import { useTranslation } from "react-i18next"
import { $api } from "src/shared/api"
import { useMe, useResponsive } from "src/shared/hooks"
import { useThemeStore } from "src/shared/store"
import { Brandmark } from "src/shared/ui"
import { formatDate, tokenStorage } from "src/shared/utils"

const ON_DARK = "rgba(255,255,255,0.86)"

const SECTIONS = [
	{ to: "/", key: "day" },
	{ to: "/candidates", key: "candidates" },
	{ to: "/registry", key: "registry" },
	{ to: "/import", key: "import" },
] as const

export const AppHeader: FC = () => {
	const { t } = useTranslation()
	const navigate = useNavigate()
	const queryClient = useQueryClient()
	const { isMobile, isDesktop } = useResponsive()
	const { mode, toggle } = useThemeStore()
	const pathname = useRouterState({ select: (s) => s.location.pathname })
	const me = useMe()

	// Revokes only this token (§7.1); a 401 here means "already signed out".
	const logoutMutation = $api.useMutation("post", "/auth/logout", { meta: { silent: true } })
	const logout = () => {
		void logoutMutation.mutateAsync({}).finally(() => {
			tokenStorage.remove()
			queryClient.clear()
			void navigate({ to: "/login" })
		})
	}

	const active = SECTIONS.filter((s) => (s.to === "/" ? pathname === "/" : pathname.startsWith(s.to))).at(-1)?.to ?? "/"

	return (
		<Layout.Header
			style={{
				position: "sticky",
				top: 0,
				zIndex: 100,
				display: "flex",
				alignItems: "center",
				gap: 16,
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
						<div style={{ color: "#f2b544", fontSize: 12, fontWeight: 500 }}>
							{me.data?.scope.markets.map((m) => m.name).join(", ") || t("app.subtitle")}
						</div>
					</div>
				)}
			</Flex>

			<Menu
				theme={"dark"}
				mode={"horizontal"}
				selectedKeys={[active]}
				onClick={({ key }) => void navigate({ to: key })}
				items={SECTIONS.map((s) => ({ key: s.to, label: t(`nav.${s.key}`) }))}
				style={{ flex: 1, minWidth: 0, background: "transparent", borderBottom: "none" }}
			/>

			<Flex
				align={"center"}
				gap={6}
				style={{ flexShrink: 0 }}
			>
				{isDesktop && me.data ? (
					<Tooltip title={t("common.account_until", { date: formatDate(me.data.account_expires_at.slice(0, 10)) })}>
						<span style={{ color: ON_DARK, fontSize: 13, marginRight: 8, whiteSpace: "nowrap" }}>
							<UserOutlined style={{ marginRight: 6, color: "#f2b544" }} />
							{me.data.name}
						</span>
					</Tooltip>
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
						loading={logoutMutation.isPending}
						onClick={logout}
						style={{ color: ON_DARK }}
					/>
				</Tooltip>
			</Flex>
		</Layout.Header>
	)
}
