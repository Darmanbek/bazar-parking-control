// The assignment history of one contract (A1: closed ones stay, greyed out).

import { Table } from "antd"
import type { FC } from "react"
import { useTranslation } from "react-i18next"
import { normalizePlate } from "src/shared/utils"
import type { AssignmentItem } from "src/features/route/data/route.keys.ts"
import { assignmentState } from "src/features/route/utils/assignment-state.ts"
import { CorrectionsList } from "../corrections-list.tsx"
import { useAssignmentsColumns } from "./assignments.columns.tsx"

interface AssignmentsTableProps {
	assignments: AssignmentItem[]
	routeNumber: string
	today: string
	filter?: string
}

export const AssignmentsTable: FC<AssignmentsTableProps> = ({ assignments, routeNumber, today, filter }) => {
	const { t } = useTranslation()
	const columns = useAssignmentsColumns(routeNumber, today)
	const needle = filter ? normalizePlate(filter) : ""
	const rows = assignments.filter((a) => !needle || a.plate.includes(needle) || a.original_plate.includes(needle))

	return (
		<Table<AssignmentItem>
			rowKey={"id"}
			size={"small"}
			columns={columns}
			dataSource={rows}
			pagination={false}
			scroll={{ x: "max-content" }}
			locale={{ emptyText: t("route.no_assignments") }}
			rowClassName={(row) => {
				const state = assignmentState(row, today)
				return state === "closed" || state === "empty" ? "row-closed" : ""
			}}
			expandable={{
				rowExpandable: (row) => row.corrections.length > 0,
				expandedRowRender: (row) => (
					<CorrectionsList
						corrections={row.corrections}
						currentPlate={row.plate}
					/>
				),
			}}
		/>
	)
}
