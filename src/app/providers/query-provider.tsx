import { QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import type { FC, ReactNode } from "react"
import { queryClient } from "src/shared/config/query-client.ts"

export const ReactQueryProvider: FC<{ children: ReactNode }> = ({ children }) => (
	<QueryClientProvider client={queryClient}>
		{children}
		<ReactQueryDevtools buttonPosition={"bottom-left"} />
	</QueryClientProvider>
)
