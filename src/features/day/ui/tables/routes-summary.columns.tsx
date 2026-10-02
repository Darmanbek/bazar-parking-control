import { Flex, Tag, Typography } from "antd"
import type { ColumnsType } from "antd/es/table/interface"
import { useTranslation } from "react-i18next"
import type { RouteSummary } from "src/features/day/data/day.keys.ts"

const num = (v: number | null) => <span className={"mono-num"}>{v ?? "—"}</span>

export const useRoutesSummaryColumns = (): ColumnsType<RouteSummary> => {
	const { t } = useTranslation()

	return [
		{
			title: t("day.route"),
			key: "route",
			render: (_v, row) => (
				<div>
					<Typography.Text strong={true}>{row.route.number}</Typography.Text>
					<div style={{ fontSize: 12, opacity: 0.65 }}>{row.route.name}</div>
				</div>
			),
		},
		{
			title: t("day.carrier"),
			dataIndex: "carrier",
			key: "carrier",
			render: (v: string | null) => v ?? "—",
		},
		{ title: t("day.quota"), dataIndex: "quota", key: "quota", align: "right", render: num },
		{ title: t("day.assigned"), dataIndex: "assigned_count", key: "assigned", align: "right", render: num },
		{ title: t("day.seen"), dataIndex: "seen_assigned_count", key: "seen", align: "right", render: num },
		{ title: t("day.unseen_30d"), dataIndex: "unseen_30d_count", key: "unseen", align: "right", render: num },
		{
			title: "",
			key: "flags",
			render: (_v, row) => (
				<Flex
					gap={4}
					wrap={"wrap"}
				>
					{row.over_quota ? <Tag color={"orange"}>{t("day.over_quota")}</Tag> : null}
					{row.no_active_contract ? <Tag>{t("day.no_contract")}</Tag> : null}
				</Flex>
			),
		},
	]
}
