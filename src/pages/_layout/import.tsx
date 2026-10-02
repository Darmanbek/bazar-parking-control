import { createFileRoute } from "@tanstack/react-router"
import { ImportPage } from "src/features/registry-import"

export const Route = createFileRoute("/_layout/import")({
	component: ImportPage,
})
