import { Outlet } from "@tanstack/react-router"
import { Flex, Layout } from "antd"
import type { FC } from "react"
import { useResponsive } from "src/shared/hooks"
import { AppHeader } from "./header.tsx"

export const MainLayout: FC = () => {
	const { isDesktop } = useResponsive()

	return (
		<Layout style={{ minHeight: "100vh" }}>
			<AppHeader />
			<Layout.Content style={{ padding: isDesktop ? "24px 28px 40px" : "16px 12px 32px" }}>
				<Flex
					vertical={true}
					gap={isDesktop ? 20 : 14}
					style={{ maxWidth: 1480, margin: "0 auto" }}
				>
					<Outlet />
				</Flex>
			</Layout.Content>
		</Layout>
	)
}
