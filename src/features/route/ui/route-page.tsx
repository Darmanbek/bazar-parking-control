// One route of the registry (§7.2): every contract, newest first, each with its
// assignment history — closed ones greyed, corrected ones marked. Edits go
// through the three form modals (§7.5–7.7); there is no "delete" (A1).

import { SearchOutlined } from "@ant-design/icons"
import { useParams, useRouter } from "@tanstack/react-router"
import { Card, Flex, Result, Skeleton } from "antd"
import type { FC } from "react"
import { useTranslation } from "react-i18next"
import { $api } from "src/shared/api"
import { useSearchParams, useViewWindow } from "src/shared/hooks"
import { InputSearch } from "src/shared/ui"
import { BackButton, RefetchButton } from "src/widgets/actions"
import { PageHeader } from "src/widgets/shared"
import { ContractCard } from "./contract-card.tsx"
import { AssignmentAddForm } from "./forms/assignment-add.form.tsx"
import { AssignmentCloseForm } from "./forms/assignment-close.form.tsx"
import { AssignmentCorrectForm } from "./forms/assignment-correct.form.tsx"

export const RoutePage: FC = () => {
	const { t } = useTranslation()
	const router = useRouter()
	const { routeId } = useParams({ from: "/_layout/registry/$routeId" })
	const { search, setParams } = useSearchParams()
	const { today } = useViewWindow()

	const query = $api.useQuery(
		"get",
		"/routes/{id}",
		{ params: { path: { id: Number(routeId) } } },
		{ meta: { silent: true } }
	)
	const route = query.data?.data

	const back = () => (router.history.canGoBack() ? router.history.back() : void router.navigate({ to: "/registry" }))

	if (query.isError) {
		return (
			<Result
				status={"404"}
				title={t("route.not_found")}
				extra={<BackButton onClick={back} />}
			/>
		)
	}

	return (
		<>
			<PageHeader
				prefix={<BackButton onClick={back} />}
				title={route ? `${route.number} · ${route.name}` : t("registry.title")}
				subtitle={t("route.contracts")}
				extra={
					<>
						<InputSearch
							value={search.q}
							onChange={(v) => setParams({ q: v })}
							placeholder={t("route.search")}
							prefix={<SearchOutlined style={{ opacity: 0.5 }} />}
						/>
						<RefetchButton
							onClick={() => void query.refetch()}
							loading={query.isFetching}
						/>
					</>
				}
			/>
			{route ? (
				<Flex
					vertical={true}
					gap={16}
				>
					{route.contracts.map((contract) => (
						<ContractCard
							key={contract.id}
							contract={contract}
							routeNumber={route.number}
							today={today}
							filter={search.q}
						/>
					))}
				</Flex>
			) : (
				<Card>
					<Skeleton
						active={true}
						paragraph={{ rows: 6 }}
					/>
				</Card>
			)}
			<AssignmentAddForm />
			<AssignmentCloseForm />
			<AssignmentCorrectForm />
		</>
	)
}
