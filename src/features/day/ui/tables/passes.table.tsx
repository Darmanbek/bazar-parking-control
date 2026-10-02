// Visits of registry plates on the day (§7.8). Plates outside the registry are
// never listed here — only counted in "Остальные" (A10). The plate filter acts
// on the rows of the current page: the API has no plate search (TZ 2.4).

import { SearchOutlined } from "@ant-design/icons"
import { keepPreviousData } from "@tanstack/react-query"
import { Flex, Segmented, Tooltip, Typography } from "antd"
import type { FC } from "react"
import { useTranslation } from "react-i18next"
import { $api } from "src/shared/api"
import { useSearchParams, useUrlPagination } from "src/shared/hooks"
import { InputSearch, Table } from "src/shared/ui"
import { normalizePlate } from "src/shared/utils"
import { ExportButton } from "src/widgets/actions"
import type { Pass } from "src/features/day/data/day.keys.ts"
import { usePassesColumns } from "./passes.columns.tsx"

type StatusFilter = Pass["status"] | "all"

interface PassesTableProps {
	date: string
	refetchInterval: number | false
}

export const PassesTable: FC<PassesTableProps> = ({ date, refetchInterval }) => {
	const { t } = useTranslation()
	const pagination = useUrlPagination()
	const { search, setFilter, setParams } = useSearchParams()
	const columns = usePassesColumns(pagination)
	const status = search.status

	const query = $api.useQuery(
		"get",
		"/passes",
		{ params: { query: { date, status, page: pagination.current, per_page: pagination.pageSize } } },
		{ refetchInterval, placeholderData: keepPreviousData }
	)

	const needle = search.q ? normalizePlate(search.q) : ""
	const rows = (query.data?.data ?? []).filter((row) => !needle || row.plate.includes(needle))

	return (
		<Table<Pass>
			title={
				<Typography.Title
					level={5}
					style={{ margin: 0 }}
				>
					{t("day.passes")}
				</Typography.Title>
			}
			extra={
				<>
					<Segmented<StatusFilter>
						value={status ?? "all"}
						onChange={(v) => setFilter("status", v === "all" ? undefined : v)}
						options={[
							{ value: "all", label: t("common.all") },
							{ value: "permitted", label: t("status.permitted") },
							{ value: "expired", label: t("status.expired") },
						]}
						style={{ maxWidth: "100%", overflowX: "auto" }}
					/>
					<ExportButton
						path={"/exports/passes"}
						params={{ query: { date, status } }}
						filename={t("day.export_name", { date })}
						disabled={query.data?.meta.registry_state === "not_maintained"}
					/>
				</>
			}
			filters={
				<Flex
					gap={8}
					align={"center"}
				>
					<Tooltip title={t("common.page_filter_hint")}>
						<span>
							<InputSearch
								value={search.q}
								// Filtering on screen only: the page stays where it is.
								onChange={(v) => setParams({ q: v })}
								placeholder={t("common.search_plate")}
								prefix={<SearchOutlined style={{ opacity: 0.5 }} />}
							/>
						</span>
					</Tooltip>
				</Flex>
			}
			columns={columns}
			dataSource={rows}
			// A background poll must not flash the spinner; a new day or page does.
			loading={query.isPending || query.isPlaceholderData}
			pagination={{
				current: pagination.current,
				pageSize: pagination.pageSize,
				total: query.data?.meta.total ?? 0,
				onChange: pagination.onChange,
				pageSizeOptions: [20, 50, 100, 200],
			}}
		/>
	)
}
