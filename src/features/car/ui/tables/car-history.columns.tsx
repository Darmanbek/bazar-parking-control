import { LoginOutlined, LogoutOutlined } from "@ant-design/icons"
import { Tag } from "antd"
import type { ColumnsType } from "antd/es/table/interface"
import { useTranslation } from "react-i18next"
import type { PaginationState } from "src/shared/hooks"
import { formatDate, formatTime } from "src/shared/utils"
import { CarPhoto } from "src/widgets/car"
import type { CarEvent } from "src/features/car/data/car.keys.ts"

export const useCarHistoryColumns = ({ current, pageSize }: PaginationState): ColumnsType<CarEvent> => {
	const { t } = useTranslation()

	return [
		{
			title: t("cars.index"),
			key: "index",
			width: 56,
			align: "center",
			render: (_v, _row, i) => <span className={"mono-num"}>{(current - 1) * pageSize + i + 1}</span>,
		},
		{
			title: t("cars.photo"),
			dataIndex: "photo_url",
			key: "photo",
			width: 120,
			render: (src: string, row) => (
				<CarPhoto
					src={src}
					alt={formatTime(row.detected_at)}
				/>
			),
		},
		{
			title: t("car.detected_at"),
			dataIndex: "detected_at",
			key: "date",
			render: (v: string) => <span className={"mono-num"}>{formatDate(v)}</span>,
		},
		{
			title: t("car.time"),
			dataIndex: "detected_at",
			key: "time",
			render: (v: string) => <span className={"mono-num"}>{formatTime(v)}</span>,
		},
		{
			title: t("car.direction"),
			dataIndex: "direction",
			key: "direction",
			render: (direction: CarEvent["direction"]) =>
				direction === "in" ? (
					<Tag
						color={"blue"}
						icon={<LoginOutlined />}
					>
						{t("car.in")}
					</Tag>
				) : (
					<Tag icon={<LogoutOutlined />}>{t("car.out")}</Tag>
				),
		},
	]
}
