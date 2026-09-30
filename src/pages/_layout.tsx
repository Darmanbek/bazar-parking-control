import { createFileRoute, redirect } from "@tanstack/react-router"
import { tokenStorage } from "src/shared/utils"
import { MainLayout } from "src/widgets/layout"

// Pathless layout route: the authenticated shell. No token means no session.
export const Route = createFileRoute("/_layout")({
	beforeLoad: () => {
		if (!tokenStorage.get()) throw redirect({ to: "/login" })
	},
	component: MainLayout,
})
