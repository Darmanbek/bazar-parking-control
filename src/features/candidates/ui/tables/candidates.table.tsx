// Repeating plates outside the registry (§7.9). The only place a plate that is
// not in the registry is ever shown (A10); the rest stay a number ("Остальные").

import { SearchOutlined } from "@ant-design/icons"
import type { UseQueryResult } from "@tanstack/react-query"
import { Tooltip, Typography } from "antd"
import type { FC } from "react"
import { useTranslation } from "react-i18next"
import type { Schemas } from "src/shared/api"
import { useSearchParams, useUrlPagination } from "src/shared/hooks"
import { InputSearch, Table } from "src/shared/ui"
import { normalizePlate } from "src/shared/utils"
import { ExportButton } from "src/widgets/actions"
import { OthersStat } from "src/widgets/shared"
import type { Candidate } from "src/features/candidates/data/candidates.keys.ts"
import { CandidateDays } from "../candidate-days.tsx"
import { useCandidatesColumns } from "./candidates.columns.tsx"

interface CandidatesTableProps {
	// The query lives in the page: its meta.thresholds also feeds the K/N fields.
	query: UseQueryResult<Schemas["CandidatesPage"], Schemas["ErrorResponse"]>
	date: string
	exportParams: { date: string; min_days?: number; min_visits?: number }
}

export const CandidatesTable: FC<CandidatesTableProps> = ({ query, date, exportParams }) => {
	const { t } = useTranslation()
	const pagination = useUrlPagination()
	const { search, setParams } = useSearchParams()
	const columns = useCandidatesColumns(pagination, date)

	const needle = search.q ? normalizePlate(search.q) : ""
	const rows = (query.data?.data ?? []).filter((row) => !needle || row.plate.includes(needle))

	return (
		<Table<Candidate>
			title={
				<Typography.Title
					level={5}
					style={{ margin: 0 }}
				>
					{t("candidates.title")}
				</Typography.Title>
			}
			extra={
				<ExportButton
					path={"/exports/candidates"}
					params={{ query: exportParams }}
					filename={t("candidates.export_name", { date })}
					disabled={query.data?.meta.registry_state === "not_maintained"}
				/>
			}
			filters={
				<>
					<Tooltip title={t("common.page_filter_hint")}>
						<span>
							<InputSearch
								value={search.q}
								onChange={(v) => setParams({ q: v })}
								placeholder={t("common.search_plate")}
								prefix={<SearchOutlined style={{ opacity: 0.5 }} />}
							/>
						</span>
					</Tooltip>
					<OthersStat others={query.data?.meta.others} />
				</>
			}
			rowKey={"plate"}
			columns={columns}
			dataSource={rows}
			loading={query.isPending || query.isPlaceholderData}
			expandable={{ expandedRowRender: (row) => <CandidateDays days={row.days} /> }}
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
