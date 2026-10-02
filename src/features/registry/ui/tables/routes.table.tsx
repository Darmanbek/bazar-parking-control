// Routes of the registry (§7.2), with the contract current on the chosen day.
// The registry is global (A5) and short (dozens of routes, no pagination), so
// the route filter works on the whole list.

import { SearchOutlined } from "@ant-design/icons"
import { keepPreviousData } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import type { FC } from "react"
import { useTranslation } from "react-i18next"
import { $api } from "src/shared/api"
import { useSearchParams } from "src/shared/hooks"
import { InputSearch, Table } from "src/shared/ui"
import { type RouteRow, useRoutesColumns } from "./routes.columns.tsx"

export const RoutesTable: FC<{ date: string | undefined }> = ({ date }) => {
	const { t } = useTranslation()
	const navigate = useNavigate()
	const { search, setParams } = useSearchParams()
	const columns = useRoutesColumns()

	const query = $api.useQuery(
		"get",
		"/routes",
		{ params: { query: date ? { date } : {} } },
		{ placeholderData: keepPreviousData }
	)

	const needle = search.q?.trim().toUpperCase() ?? ""
	const rows = (query.data?.data ?? []).filter(
		(r) => !needle || r.number.toUpperCase().includes(needle) || r.name.toUpperCase().includes(needle)
	)

	return (
		<Table<RouteRow>
			title={
				<InputSearch
					value={search.q}
					onChange={(v) => setParams({ q: v })}
					placeholder={t("registry.search")}
					prefix={<SearchOutlined style={{ opacity: 0.5 }} />}
				/>
			}
			columns={columns}
			dataSource={rows}
			loading={query.isPending || query.isPlaceholderData}
			pagination={false}
			onRow={(row) => ({
				onClick: () => void navigate({ to: "/registry/$routeId", params: { routeId: String(row.id) } }),
				style: { cursor: "pointer" },
			})}
		/>
	)
}
