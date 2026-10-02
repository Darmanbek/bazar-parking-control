// Per-route summary of the day (§7.10). A row opens the route in the registry.

import { useNavigate } from "@tanstack/react-router"
import { Typography } from "antd"
import type { FC } from "react"
import { useTranslation } from "react-i18next"
import type { Schemas } from "src/shared/api"
import { Table } from "src/shared/ui"
import { OthersStat } from "src/widgets/shared"
import type { RouteSummary } from "src/features/day/data/day.keys.ts"
import { useRoutesSummaryColumns } from "./routes-summary.columns.tsx"

interface RoutesSummaryTableProps {
	summary: Schemas["RoutesSummary"] | undefined
	loading: boolean
}

export const RoutesSummaryTable: FC<RoutesSummaryTableProps> = ({ summary, loading }) => {
	const { t } = useTranslation()
	const navigate = useNavigate()
	const columns = useRoutesSummaryColumns()

	return (
		<Table<RouteSummary>
			title={
				<Typography.Title
					level={5}
					style={{ margin: 0 }}
				>
					{t("day.summary")}
				</Typography.Title>
			}
			filters={<OthersStat others={summary?.meta.others} />}
			rowKey={(row) => row.route.id}
			columns={columns}
			dataSource={summary?.data ?? []}
			loading={loading}
			pagination={false}
			size={"middle"}
			onRow={(row) => ({
				onClick: () => void navigate({ to: "/registry/$routeId", params: { routeId: String(row.route.id) } }),
				style: { cursor: "pointer" },
			})}
		/>
	)
}
