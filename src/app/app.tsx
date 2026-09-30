import { RouterProvider } from "@tanstack/react-router"
import type { FC } from "react"
import { Providers } from "./providers"
import { router } from "./router.tsx"

export const App: FC = () => (
	<Providers>
		<RouterProvider router={router} />
	</Providers>
)
