import { createFileRoute, redirect } from "@tanstack/react-router"
import { logoutReason, tokenStorage } from "src/shared/utils"
import { MainLayout } from "src/widgets/layout"

// Pathless layout route: the authenticated shell. No token, or a token past
// its `expires_at` (§4.1), means no session.
export const Route = createFileRoute("/_layout")({
	beforeLoad: () => {
		if (tokenStorage.isValid()) return
		if (tokenStorage.get()) logoutReason.set("unauthenticated")
		tokenStorage.remove()
		throw redirect({ to: "/login" })
	},
	component: MainLayout,
})
