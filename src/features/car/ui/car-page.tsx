// One car: its latest snapshot and details, then its history for the period.

import { keepPreviousData, useIsFetching, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "@tanstack/react-router"
import { Result } from "antd"
import type { FC } from "react"
import { useTranslation } from "react-i18next"
import { $api } from "src/shared/api"
import { useDateRange, useUrlPagination } from "src/shared/hooks"
import { useRefetchInterval } from "src/shared/store"
import { AutoRefreshControl, BackButton, RefetchButton } from "src/widgets/actions"
import { DateRangeFilter, PageHeader } from "src/widgets/shared"
import { CAR_DEFAULT_DAYS, CAR_HISTORY_KEY, CAR_KEY } from "src/features/car/data/car.keys.ts"
import { useCarHistoryExport } from "src/features/car/hooks/use-car-history-export.ts"
import { useCarId } from "src/features/car/hooks/use-car-id.ts"
import { CarSummary } from "./car-summary.tsx"
import { CarHistoryTable } from "./tables/car-history.table.tsx"

export const CarPage: FC = () => {
	const { t } = useTranslation()
	const router = useRouter()
	const queryClient = useQueryClient()
	const carId = useCarId()
	const { dateFrom, dateTo } = useDateRange(CAR_DEFAULT_DAYS)
	const pagination = useUrlPagination()
	const refetchInterval = useRefetchInterval()

	const car = $api.useQuery(
		"get",
		"/api/v1/cars/{car_id}",
		{ params: { path: { car_id: carId } } },
		{ refetchInterval, meta: { silent: true } }
	)
	const history = $api.useQuery(
		"get",
		"/api/v1/cars/{car_id}/history",
		{
			params: {
				path: { car_id: carId },
				query: { date_from: dateFrom, date_to: dateTo, page: pagination.current, page_size: pagination.pageSize },
			},
		},
		{ refetchInterval, placeholderData: keepPreviousData }
	)
	const { exportExcel, loading: exporting } = useCarHistoryExport(carId, car.data?.number)

	const fetching = useIsFetching({ queryKey: CAR_KEY }) + useIsFetching({ queryKey: CAR_HISTORY_KEY }) > 0
	const refresh = () =>
		void Promise.all([
			queryClient.refetchQueries({ queryKey: CAR_KEY, type: "active" }),
			queryClient.refetchQueries({ queryKey: CAR_HISTORY_KEY, type: "active" }),
		])

	// Back to wherever the guard came from (the dashboard keeps its filters in
	// its own URL); straight to the dashboard when the page was opened directly.
	const back = () => (router.history.canGoBack() ? router.history.back() : void router.navigate({ to: "/" }))

	if (car.isError) {
		return (
			<Result
				status={"404"}
				title={"404"}
				subTitle={t("search.empty")}
				extra={<BackButton onClick={back} />}
			/>
		)
	}

	return (
		<>
			<PageHeader
				prefix={<BackButton onClick={back} />}
				title={t("car.title")}
				extra={
					<>
						<AutoRefreshControl />
						<DateRangeFilter defaultDays={CAR_DEFAULT_DAYS} />
						<RefetchButton
							onClick={refresh}
							loading={fetching}
						/>
					</>
				}
			/>
			<CarSummary
				car={car.data}
				visitsInRange={history.data?.meta.total}
			/>
			<CarHistoryTable
				query={history}
				pagination={pagination}
				onExport={exportExcel}
				exporting={exporting}
			/>
		</>
	)
}
