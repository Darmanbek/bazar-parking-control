import type { FC, ReactNode } from "react"
import { AntdProvider } from "./antd-provider.tsx"
import { ReactQueryProvider } from "./query-provider.tsx"

export const Providers: FC<{ children: ReactNode }> = ({ children }) => (
	<ReactQueryProvider>
		<AntdProvider>{children}</AntdProvider>
	</ReactQueryProvider>
)
