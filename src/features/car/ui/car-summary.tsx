// Who this car is: the latest snapshot next to its plate, status and dates.

import { Card, Col, Descriptions, Flex, Row, Skeleton } from "antd"
import type { FC } from "react"
import { useTranslation } from "react-i18next"
import type { Schemas } from "src/shared/api"
import { PlateNumber } from "src/shared/ui"
import { formatDateTime } from "src/shared/utils"
import { CarPhoto, CarStatusTag } from "src/widgets/car"

interface CarSummaryProps {
	car: Schemas["CarRead"] | undefined
	/** Detections inside the chosen window — the history table's total. */
	visitsInRange: number | undefined
}

export const CarSummary: FC<CarSummaryProps> = ({ car, visitsInRange }) => {
	const { t } = useTranslation()

	if (!car) {
		return (
			<Card>
				<Skeleton
					active={true}
					paragraph={{ rows: 4 }}
				/>
			</Card>
		)
	}

	return (
		<Card styles={{ body: { padding: 20 } }}>
			<Row
				gutter={[24, 20]}
				align={"middle"}
			>
				<Col
					xs={24}
					md={10}
					lg={8}
				>
					<CarPhoto
						src={car.photo_url}
						alt={car.number}
						width={"100%"}
						height={"auto"}
					/>
				</Col>
				<Col
					xs={24}
					md={14}
					lg={16}
				>
					<Flex
						align={"center"}
						gap={14}
						wrap={"wrap"}
						style={{ marginBottom: 18 }}
					>
						<PlateNumber
							number={car.number}
							size={"large"}
						/>
						<CarStatusTag status={car.status} />
					</Flex>
					<Descriptions
						column={{ xs: 1, sm: 2, lg: 3 }}
						layout={"vertical"}
						colon={false}
						items={[
							{
								key: "first",
								label: t("car.first_seen"),
								children: <span className={"mono-num"}>{formatDateTime(car.first_seen_at)}</span>,
							},
							{
								key: "last",
								label: t("car.last_seen"),
								children: <span className={"mono-num"}>{formatDateTime(car.last_seen_at)}</span>,
							},
							{
								key: "visits",
								label: t("car.visits_in_range"),
								children: (
									<span
										className={"mono-num"}
										style={{ fontSize: 22, fontWeight: 700 }}
									>
										{visitsInRange ?? "—"}
									</span>
								),
							},
						]}
					/>
				</Col>
			</Row>
		</Card>
	)
}
