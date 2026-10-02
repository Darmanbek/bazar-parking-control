// "День" (§9 step 2): the route summary of one day in the view window, then the
// visits of registry plates. A day before the first import is "not maintained"
// — a banner, not an empty list (§3.2).

import { keepPreviousData, useIsFetching, useQueryClient } from "@tanstack/react-query"
import { Alert } from "antd"
import type { FC } from "react"
import { useTranslation } from "react-i18next"
import { $api } from "src/shared/api"
import { useMe } from "src/shared/hooks"
import { AutoRefreshControl, RefetchButton } from "src/widgets/actions"
import { DayFilter, PageHeader, RegistryStateAlert } from "src/widgets/shared"
import { PASSES_KEY, SUMMARY_KEY } from "src/features/day/data/day.keys.ts"
import { useDay } from "src/features/day/hooks/use-day.ts"
import { DayStats } from "./day-stats.tsx"
import { PassesTable } from "./tables/passes.table.tsx"
import { RoutesSummaryTable } from "./tables/routes-summary.table.tsx"

export const DayPage: FC = () => {
	const { t } = useTranslation()
	const queryClient = useQueryClient()
	const me = useMe()
	const { date, isToday, refetchInterval } = useDay()

	const summary = $api.useQuery(
		"get",
		"/summary/routes",
		{ params: { query: { date } } },
		{ refetchInterval, placeholderData: keepPreviousData }
	)

	const fetching = useIsFetching({ queryKey: SUMMARY_KEY }) + useIsFetching({ queryKey: PASSES_KEY }) > 0
	const refresh = () =>
		void Promise.all([
			queryClient.refetchQueries({ queryKey: SUMMARY_KEY, type: "active" }),
			queryClient.refetchQueries({ queryKey: PASSES_KEY, type: "active" }),
		])

	const loading = summary.isPending || summary.isPlaceholderData

	return (
		<>
			<PageHeader
				title={t("day.title")}
				extra={
					<>
						<AutoRefreshControl
							disabled={!isToday}
							disabledReason={t("day.live_only_today")}
						/>
						<DayFilter
							value={date}
							max={"today"}
						/>
						<RefetchButton
							onClick={refresh}
							loading={fetching}
						/>
					</>
				}
			/>
			{me.data && me.data.scope.markets.length === 0 ? (
				<Alert
					type={"info"}
					showIcon={true}
					title={t("state.empty_scope")}
				/>
			) : null}
			<RegistryStateAlert state={summary.data?.meta.registry_state} />
			<DayStats
				totals={summary.data?.totals}
				loading={loading}
			/>
			<RoutesSummaryTable
				summary={summary.data}
				loading={loading}
			/>
			<PassesTable
				date={date}
				refetchInterval={refetchInterval}
			/>
		</>
	)
}
