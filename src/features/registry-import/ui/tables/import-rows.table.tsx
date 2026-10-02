// Every row of the preview, errors first (§7.3). Rows can number in the
// hundreds, so they page locally; the whole preview is already in memory.

import { Switch, Typography } from "antd"
import type { FC } from "react"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Table } from "src/shared/ui"
import { type ImportRow, issueRank } from "src/features/registry-import/data/import.keys.ts"
import { useImportRowsColumns } from "./import-rows.columns.tsx"

export const ImportRowsTable: FC<{ rows: ImportRow[] }> = ({ rows }) => {
	const { t } = useTranslation()
	const columns = useImportRowsColumns()
	const hasIssues = rows.some((r) => issueRank(r) < 2)
	const [onlyIssues, setOnlyIssues] = useState(hasIssues)

	const sorted = rows
		.map((row, index) => ({ row, index }))
		.filter(({ row }) => !onlyIssues || issueRank(row) < 2)
		.sort((a, b) => issueRank(a.row) - issueRank(b.row) || a.index - b.index)
		.map(({ row }) => row)

	return (
		<Table<ImportRow>
			title={
				<Typography.Title
					level={5}
					style={{ margin: 0 }}
				>
					{t("import.rows")}
				</Typography.Title>
			}
			extra={
				<label style={{ display: "flex", gap: 8, alignItems: "center", cursor: "pointer" }}>
					<Switch
						size={"small"}
						checked={onlyIssues}
						onChange={setOnlyIssues}
					/>
					{t("import.only_issues")}
				</label>
			}
			// Closing rows have no sheet row; the plate/route pair is unique per preview.
			rowKey={(row) =>
				`${row.row ?? "x"}-${row.assignment_id ?? ""}-${row.route_number ?? ""}-${row.plate ?? ""}-${row.action}`
			}
			rowClassName={(row) => (row.errors.length ? "row-error" : "")}
			columns={columns}
			dataSource={sorted}
			pagination={{ pageSize: 50, showSizeChanger: false }}
			size={"small"}
		/>
	)
}
