// The three counters from the sketch. Each tile also filters the table below
// by status; the "total" tile clears that filter.

import { CarOutlined, CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons"
import { keepPreviousData } from "@tanstack/react-query"
import { Col, Row, Typography } from "antd"
import type { FC } from "react"
import { useTranslation } from "react-i18next"
import { $api } from "src/shared/api"
import { useSearchParams } from "src/shared/hooks"
import { useRefetchInterval } from "src/shared/store"
import { STATUS_COLOR } from "src/widgets/car"
import { KpiCard } from "src/widgets/shared"
import { useCarsFilters } from "src/features/cars/hooks/use-cars-filters.ts"

const TOTAL_COLOR = "#f2b544"

export const CarsStats: FC = () => {
	const { t } = useTranslation()
	const { date_from, date_to, status } = useCarsFilters()
	const { setFilter } = useSearchParams()
	const refetchInterval = useRefetchInterval()

	const { data } = $api.useQuery(
		"get",
		"/api/v1/cars/stats",
		{ params: { query: { date_from, date_to } } },
		{ refetchInterval, placeholderData: keepPreviousData }
	)

	const share = (n: number | undefined) =>
		data && n !== undefined && data.total > 0 ? (
			<Typography.Text
				type={"secondary"}
				style={{ fontSize: 13 }}
			>
				{t("cars.share", { percent: Math.round((n / data.total) * 100) })}
			</Typography.Text>
		) : null

	return (
		<Row gutter={[16, 16]}>
			<Col
				xs={24}
				md={8}
			>
				<KpiCard
					title={t("cars.total")}
					value={data?.total}
					icon={<CarOutlined />}
					color={TOTAL_COLOR}
					active={!status}
					onClick={() => setFilter("status", undefined)}
				/>
			</Col>
			<Col
				xs={24}
				md={8}
			>
				<KpiCard
					title={t("cars.licensed")}
					value={data?.licensed}
					icon={<CheckCircleOutlined />}
					color={STATUS_COLOR.licensed}
					footer={share(data?.licensed)}
					active={status === "licensed"}
					onClick={() => setFilter("status", status === "licensed" ? undefined : "licensed")}
				/>
			</Col>
			<Col
				xs={24}
				md={8}
			>
				<KpiCard
					title={t("cars.unlicensed")}
					value={data?.unlicensed}
					icon={<CloseCircleOutlined />}
					color={STATUS_COLOR.unlicensed}
					footer={share(data?.unlicensed)}
					active={status === "unlicensed"}
					onClick={() => setFilter("status", status === "unlicensed" ? undefined : "unlicensed")}
				/>
			</Col>
		</Row>
	)
}
