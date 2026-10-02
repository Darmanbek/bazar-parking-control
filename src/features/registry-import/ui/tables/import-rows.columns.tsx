import { Flex, Tag, Typography } from "antd"
import type { ColumnsType } from "antd/es/table/interface"
import { useTranslation } from "react-i18next"
import { PlateNumber } from "src/shared/ui"
import { formatDate } from "src/shared/utils"
import { ACTION_COLOR, type ImportRow } from "src/features/registry-import/data/import.keys.ts"

const PLATE = /^\d{2}[A-Z0-9]{6}$/

export const useImportRowsColumns = (): ColumnsType<ImportRow> => {
	const { t } = useTranslation()

	return [
		{
			title: t("import.row"),
			dataIndex: "row",
			key: "row",
			width: 70,
			// `row: null` — a closing of a plate that is not in the file at all.
			render: (v: number | null) => <span className={"mono-num"}>{v ?? "—"}</span>,
		},
		{
			title: t("import.action"),
			dataIndex: "action",
			key: "action",
			render: (action: ImportRow["action"]) => <Tag color={ACTION_COLOR[action]}>{t(`import.actions.${action}`)}</Tag>,
		},
		{
			title: t("import.route"),
			key: "route",
			render: (_v, row) => (
				<div>
					{row.route_number ?? "—"}
					{row.from_route_number && row.from_route_number !== row.route_number ? (
						<div style={{ fontSize: 12, opacity: 0.65 }}>
							{t("import.from_route", { route: row.from_route_number })}
						</div>
					) : null}
				</div>
			),
		},
		{
			title: t("import.carrier"),
			dataIndex: "carrier",
			key: "carrier",
			render: (v: string | null) => v ?? "—",
		},
		{
			title: t("import.plate"),
			dataIndex: "plate",
			key: "plate",
			// An invalid plate is shown as typed in the file, not drawn as a plate.
			render: (v: string | null) =>
				v === null ? (
					"—"
				) : PLATE.test(v) ? (
					<PlateNumber number={v} />
				) : (
					<Typography.Text code={true}>{v}</Typography.Text>
				),
		},
		{
			title: t("import.dates"),
			key: "dates",
			render: (_v, row) =>
				row.from || row.until ? (
					<span className={"mono-num"}>
						{row.from ? t("import.from_date", { date: formatDate(row.from) }) : ""}
						{row.from && row.until ? " · " : ""}
						{row.until ? t("import.until_date", { date: formatDate(row.until) }) : ""}
					</span>
				) : (
					"—"
				),
		},
		{
			title: t("import.issues"),
			key: "issues",
			// Unknown codes are shown by their message (§7.3).
			render: (_v, row) =>
				row.errors.length || row.warnings.length ? (
					<Flex
						vertical={true}
						gap={2}
					>
						{row.errors.map((e) => (
							<Typography.Text
								key={`e-${e.code}`}
								type={"danger"}
							>
								{e.message}
							</Typography.Text>
						))}
						{row.warnings.map((w) => (
							<Typography.Text
								key={`w-${w.code}`}
								type={"warning"}
							>
								{w.message}
							</Typography.Text>
						))}
					</Flex>
				) : null,
		},
	]
}
