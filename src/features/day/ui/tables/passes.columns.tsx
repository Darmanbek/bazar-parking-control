import { Link } from "@tanstack/react-router"
import type { ColumnsType } from "antd/es/table/interface"
import { useTranslation } from "react-i18next"
import type { PaginationState } from "src/shared/hooks"
import { PlateNumber } from "src/shared/ui"
import { formatPlate, formatTime } from "src/shared/utils"
import { PassStatusTag, SnapshotButton } from "src/widgets/pass"
import type { Pass } from "src/features/day/data/day.keys.ts"

export const usePassesColumns = ({ current, pageSize }: PaginationState): ColumnsType<Pass> => {
	const { t } = useTranslation()

	return [
		{
			title: t("common.index"),
			key: "index",
			width: 56,
			align: "center",
			render: (_v, _row, i) => <span className={"mono-num"}>{(current - 1) * pageSize + i + 1}</span>,
		},
		{
			title: t("day.visited_at"),
			dataIndex: "visited_at",
			key: "visited_at",
			render: (v: string) => <span className={"mono-num"}>{formatTime(v)}</span>,
		},
		{
			title: t("day.plate"),
			dataIndex: "plate",
			key: "plate",
			render: (plate: string) => <PlateNumber number={plate} />,
		},
		{
			title: t("day.status"),
			key: "status",
			render: (_v, row) => (
				<PassStatusTag
					status={row.status}
					expiredReason={row.expired_reason}
				/>
			),
		},
		{
			title: t("day.route"),
			key: "route",
			render: (_v, row) => (
				<Link
					to={"/registry/$routeId"}
					params={{ routeId: String(row.route.id) }}
				>
					{row.route.number}
					<div style={{ fontSize: 12, opacity: 0.65 }}>{row.route.name}</div>
				</Link>
			),
		},
		{
			title: t("day.carrier"),
			key: "carrier",
			render: (_v, row) => row.contract.carrier,
		},
		{
			title: t("day.frames"),
			dataIndex: "frames_count",
			key: "frames",
			align: "right",
			render: (v: number) => <span className={"mono-num"}>{v}</span>,
		},
		{
			title: t("day.snapshot"),
			key: "snapshot",
			width: 72,
			align: "center",
			// A registry visit's snapshot needs no `date` (§7.11).
			render: (_v, row) => (
				<SnapshotButton
					passId={row.id}
					title={`${formatPlate(row.plate)} · ${formatTime(row.visited_at)}`}
				/>
			),
		},
	]
}
