import { createFileRoute, redirect } from "@tanstack/react-router"
import { LoginPage } from "src/features/auth"
import { tokenStorage } from "src/shared/utils"

export const Route = createFileRoute("/login")({
	beforeLoad: () => {
		if (tokenStorage.get()) throw redirect({ to: "/" })
	},
	component: LoginPage,
})
