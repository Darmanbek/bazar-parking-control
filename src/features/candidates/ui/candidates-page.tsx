// "Кандидаты" (§9 step 3): plates outside the registry that repeat — at least
// K days with at least N visits each (A11). Closed days only. No auto-refresh:
// a closed day does not change, and every read is audited (§5.4).

import { keepPreviousData } from "@tanstack/react-query"
import type { FC } from "react"
import { useTranslation } from "react-i18next"
import { $api } from "src/shared/api"
import { useMe, useUrlPagination } from "src/shared/hooks"
import { RefetchButton } from "src/widgets/actions"
import { DayFilter, PageHeader, RegistryStateAlert } from "src/widgets/shared"
import { useCandidatesParams } from "src/features/candidates/hooks/use-candidates-params.ts"
import { CandidateThresholds } from "./candidate-thresholds.tsx"
import { CandidatesTable } from "./tables/candidates.table.tsx"

export const CandidatesPage: FC = () => {
	const { t } = useTranslation()
	const me = useMe()
	const pagination = useUrlPagination()
	const params = useCandidatesParams()

	const query = $api.useQuery(
		"get",
		"/candidates",
		{ params: { query: { ...params, page: pagination.current, per_page: pagination.pageSize } } },
		{ placeholderData: keepPreviousData }
	)

	const limits = me.data?.limits.candidates
	const applied = query.data?.meta.thresholds

	return (
		<>
			<PageHeader
				title={t("candidates.title")}
				extra={
					<>
						<DayFilter
							value={params.date}
							max={"yesterday"}
						/>
						<RefetchButton
							onClick={() => void query.refetch()}
							loading={query.isFetching}
						/>
					</>
				}
			/>
			<RegistryStateAlert state={query.data?.meta.registry_state} />
			<CandidateThresholds
				// Remount on new applied values: the fields are redrawn from them (§7.9).
				key={applied ? `${applied.min_days}-${applied.min_visits}` : "pending"}
				applied={applied}
				requested={{ min_days: params.min_days, min_visits: params.min_visits }}
				floor={{
					days: limits?.floor_min_days ?? 1,
					visits: limits?.floor_min_visits ?? 1,
					window: limits?.window_days ?? 29,
				}}
			/>
			<CandidatesTable
				query={query}
				date={params.date}
				exportParams={params}
			/>
		</>
	)
}
