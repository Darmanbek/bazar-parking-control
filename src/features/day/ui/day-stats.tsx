// The day at a glance: the totals of the route summary (§7.10). Neutral facts
// only — the system gives no verdict (A9).

import { CarOutlined, EyeInvisibleOutlined, ScheduleOutlined } from "@ant-design/icons"
import { Col, Row } from "antd"
import type { FC } from "react"
import { useTranslation } from "react-i18next"
import type { Schemas } from "src/shared/api"
import { KpiCard } from "src/widgets/shared"

interface DayStatsProps {
	totals: Schemas["SummaryTotals"] | null | undefined
	loading: boolean
}

export const DayStats: FC<DayStatsProps> = ({ totals, loading }) => {
	const { t } = useTranslation()
	// undefined → skeleton while loading; null → a dash on a "not maintained" day.
	const value = (key: keyof Schemas["SummaryTotals"]) => (loading ? undefined : (totals?.[key] ?? null))

	return (
		<Row gutter={[16, 16]}>
			<Col
				xs={24}
				md={8}
			>
				<KpiCard
					title={t("day.assigned")}
					value={value("assigned_count")}
					icon={<ScheduleOutlined />}
					color={"#f2b544"}
				/>
			</Col>
			<Col
				xs={24}
				md={8}
			>
				<KpiCard
					title={t("day.seen")}
					value={value("seen_assigned_count")}
					icon={<CarOutlined />}
					color={"#16a34a"}
				/>
			</Col>
			<Col
				xs={24}
				md={8}
			>
				<KpiCard
					title={t("day.unseen_30d")}
					value={value("unseen_30d_count")}
					icon={<EyeInvisibleOutlined />}
					color={"#64748b"}
				/>
			</Col>
		</Row>
	)
}
