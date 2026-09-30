import { Link } from "@tanstack/react-router"
import type { ColumnsType } from "antd/es/table/interface"
import { useTranslation } from "react-i18next"
import type { PaginationState } from "src/shared/hooks"
import { PlateNumber } from "src/shared/ui"
import { formatDate, formatDateTime } from "src/shared/utils"
import { OpenButton } from "src/widgets/actions"
import { CarPhoto, CarStatusTag } from "src/widgets/car"
import type { Car } from "src/features/cars/data/cars.keys.ts"
import { carSearch, useOpenCar } from "src/features/cars/hooks/use-open-car.ts"

export const useCarsColumns = ({ current, pageSize }: PaginationState): ColumnsType<Car> => {
	const { t } = useTranslation()
	const openCar = useOpenCar()

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
					alt={row.number}
				/>
			),
		},
		{
			title: t("cars.number"),
			dataIndex: "number",
			key: "number",
			render: (number: string, row) => (
				<Link
					to={"/cars/$carId"}
					params={{ carId: String(row.id) }}
					search={carSearch}
					onClick={(e) => e.stopPropagation()}
				>
					<PlateNumber number={number} />
				</Link>
			),
		},
		{
			title: t("cars.status"),
			dataIndex: "status",
			key: "status",
			render: (status: Car["status"]) => <CarStatusTag status={status} />,
		},
		{
			title: t("cars.last_seen"),
			dataIndex: "last_seen_at",
			key: "last_seen_at",
			render: (v: string) => <span className={"mono-num"}>{formatDateTime(v)}</span>,
		},
		{
			title: t("cars.first_seen"),
			dataIndex: "first_seen_at",
			key: "first_seen_at",
			render: (v: string) => <span className={"mono-num"}>{formatDate(v)}</span>,
		},
		{
			title: t("cars.visits"),
			dataIndex: "visits_count",
			key: "visits_count",
			align: "right",
			render: (v: number) => <span className={"mono-num"}>{v}</span>,
		},
		{
			title: "",
			key: "actions",
			width: 56,
			align: "right",
			render: (_v, row) => <OpenButton onClick={() => openCar(row.id)} />,
		},
	]
}
