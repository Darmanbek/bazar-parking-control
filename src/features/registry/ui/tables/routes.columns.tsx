import { Flex, Tag, Typography } from "antd"
import type { ColumnsType } from "antd/es/table/interface"
import { useTranslation } from "react-i18next"
import type { Schemas } from "src/shared/api"
import { formatDate } from "src/shared/utils"

export type RouteRow = Schemas["RouteListItem"]

export const useRoutesColumns = (): ColumnsType<RouteRow> => {
	const { t } = useTranslation()

	return [
		{
			title: t("registry.number"),
			dataIndex: "number",
			key: "number",
			render: (v: string) => <Typography.Text strong={true}>{v}</Typography.Text>,
		},
		{ title: t("registry.name"), dataIndex: "name", key: "name" },
		{
			title: t("day.carrier"),
			key: "carrier",
			render: (_v, row) => row.contract?.carrier ?? "—",
		},
		{
			title: t("registry.period"),
			key: "period",
			// valid_until is INCLUSIVE — the last day of the contract (§3.5).
			render: (_v, row) =>
				row.contract ? (
					<span className={"mono-num"}>
						{formatDate(row.contract.valid_from)} — {formatDate(row.contract.valid_until)}
					</span>
				) : (
					"—"
				),
		},
		{
			title: t("day.quota"),
			key: "quota",
			align: "right",
			render: (_v, row) => <span className={"mono-num"}>{row.contract?.quota ?? "—"}</span>,
		},
		{
			title: t("registry.assigned"),
			dataIndex: "assigned_count",
			key: "assigned",
			align: "right",
			render: (v: number) => <span className={"mono-num"}>{v}</span>,
		},
		{
			title: "",
			key: "flags",
			render: (_v, row) => (
				<Flex
					gap={4}
					wrap={"wrap"}
				>
					{row.over_quota ? <Tag color={"orange"}>{t("day.over_quota")}</Tag> : null}
					{row.contract ? null : <Tag>{t("day.no_contract")}</Tag>}
				</Flex>
			),
		},
	]
}
