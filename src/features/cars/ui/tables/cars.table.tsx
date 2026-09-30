// Cars of the chosen period. Search, status, dates and page all live in the
// URL, so a filtered view survives reload and can be sent as a link. The table
// polls on the auto-refresh interval; a click on a row opens that car.

import { SearchOutlined } from "@ant-design/icons"
import { keepPreviousData } from "@tanstack/react-query"
import { Segmented } from "antd"
import type { FC } from "react"
import { useTranslation } from "react-i18next"
import { $api, type Schemas } from "src/shared/api"
import { useSearchParams, useUrlPagination } from "src/shared/hooks"
import { useRefetchInterval } from "src/shared/store"
import { InputSearch, Table } from "src/shared/ui"
import { ExcelButton } from "src/widgets/actions"
import type { Car } from "src/features/cars/data/cars.keys.ts"
import { useCarsExport } from "src/features/cars/hooks/use-cars-export.ts"
import { useCarsFilters } from "src/features/cars/hooks/use-cars-filters.ts"
import { useOpenCar } from "src/features/cars/hooks/use-open-car.ts"
import { useCarsColumns } from "./cars.columns.tsx"

type StatusFilter = Schemas["LicenseStatus"] | "all"

export const CarsTable: FC = () => {
	const { t } = useTranslation()
	const openCar = useOpenCar()
	const pagination = useUrlPagination()
	const { setFilter } = useSearchParams()
	const filters = useCarsFilters()
	const refetchInterval = useRefetchInterval()
	const columns = useCarsColumns(pagination)
	const { exportExcel, loading: exporting } = useCarsExport()

	const query = $api.useQuery(
		"get",
		"/api/v1/cars",
		{ params: { query: { ...filters, page: pagination.current, page_size: pagination.pageSize } } },
		{ refetchInterval, placeholderData: keepPreviousData }
	)

	return (
		<Table<Car>
			title={
				<InputSearch
					value={filters.search}
					onChange={(v) => setFilter("search", v?.replace(/\s+/g, "").toUpperCase())}
					placeholder={t("cars.search_placeholder")}
					prefix={<SearchOutlined style={{ opacity: 0.5 }} />}
				/>
			}
			extra={
				<>
					<Segmented<StatusFilter>
						value={filters.status ?? "all"}
						onChange={(v) => setFilter("status", v === "all" ? undefined : v)}
						options={[
							{ value: "all", label: t("common.all") },
							{ value: "licensed", label: t("cars.licensed") },
							{ value: "unlicensed", label: t("cars.unlicensed") },
						]}
						style={{ maxWidth: "100%", overflowX: "auto" }}
					/>
					<ExcelButton
						onClick={exportExcel}
						loading={exporting}
						disabled={!query.data?.meta.total}
					/>
				</>
			}
			columns={columns}
			dataSource={query.data?.data ?? []}
			// Background polls must not flash the spinner every few seconds; only
			// a first load or a filter/page change (a new key) shows it.
			loading={query.isPending || query.isPlaceholderData}
			onRow={(row) => ({
				onClick: () => openCar(row.id),
				style: { cursor: "pointer" },
			})}
			pagination={{
				current: pagination.current,
				pageSize: pagination.pageSize,
				total: query.data?.meta.total ?? 0,
				onChange: pagination.onChange,
				showTotal: (total) => `${t("cars.total")}: ${total}`,
			}}
		/>
	)
}
