import { createFileRoute } from "@tanstack/react-router"
import { RegistryPage } from "src/features/registry"

export const Route = createFileRoute("/_layout/registry/")({
	component: RegistryPage,
})
