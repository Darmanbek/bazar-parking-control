import { createFileRoute } from "@tanstack/react-router"
import { CandidatesPage } from "src/features/candidates"

export const Route = createFileRoute("/_layout/candidates")({
	component: CandidatesPage,
})
