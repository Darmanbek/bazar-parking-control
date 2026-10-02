import type { ColumnsType } from "antd/es/table/interface"
import { useTranslation } from "react-i18next"
import type { PaginationState } from "src/shared/hooks"
import { PlateNumber } from "src/shared/ui"
import { formatDate, formatPlate, formatTime } from "src/shared/utils"
import { PassStatusTag, SnapshotButton } from "src/widgets/pass"
import type { Candidate } from "src/features/candidates/data/candidates.keys.ts"

const num = (v: number) => <span className={"mono-num"}>{v}</span>

export const useCandidatesColumns = ({ current, pageSize }: PaginationState, date: string): ColumnsType<Candidate> => {
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
					candidate={true}
				/>
			),
		},
		{ title: t("candidates.qualifying_days"), dataIndex: "qualifying_days", key: "qd", align: "right", render: num },
		{ title: t("candidates.total_visits"), dataIndex: "total_visits", key: "tv", align: "right", render: num },
		{
			title: t("candidates.first_seen"),
			dataIndex: "first_seen_date",
			key: "first",
			render: (v: string) => <span className={"mono-num"}>{formatDate(v)}</span>,
		},
		{
			title: t("candidates.last_seen"),
			dataIndex: "last_seen_date",
			key: "last",
			render: (v: string) => <span className={"mono-num"}>{formatDate(v)}</span>,
		},
		{
			title: t("day.snapshot"),
			key: "snapshot",
			width: 72,
			align: "center",
			// The last visit of THIS day, opened with the same `date` (§7.11);
			// none when the candidate did not come that day.
			render: (_v, row) => (
				<SnapshotButton
					passId={row.last_pass?.id}
					date={date}
					title={`${formatPlate(row.plate)} · ${formatDate(date)} ${row.last_pass ? formatTime(row.last_pass.visited_at) : ""}`}
					disabledReason={t("candidates.no_snapshot")}
				/>
			),
		},
	]
}
