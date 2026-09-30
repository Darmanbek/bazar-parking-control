// Excel of one car's history over the chosen period — every row, not one page.

import { useState } from "react"
import { useTranslation } from "react-i18next"
import { client } from "src/shared/api"
import { useDateRange, useMessage } from "src/shared/hooks"
import { exportToExcel } from "src/shared/lib"
import { formatDate, formatPlate, formatTime } from "src/shared/utils"
import { CAR_DEFAULT_DAYS, type CarEvent } from "src/features/car/data/car.keys.ts"

const EXPORT_LIMIT = 10000

export const useCarHistoryExport = (carId: number, number: string | undefined) => {
	const { t } = useTranslation()
	const { message } = useMessage()
	const { dateFrom, dateTo } = useDateRange(CAR_DEFAULT_DAYS)
	const [loading, setLoading] = useState(false)

	const run = async (): Promise<void> => {
		setLoading(true)
		try {
			const { data, error } = await client.GET("/api/v1/cars/{car_id}/history", {
				params: {
					path: { car_id: carId },
					query: { date_from: dateFrom, date_to: dateTo, page: 1, page_size: EXPORT_LIMIT },
				},
			})
			if (error || !data) throw new Error("export")
			if (!data.data.length) {
				message.info({ title: t("export.empty") })
				return
			}
			await exportToExcel<CarEvent>({
				filename: t("car.export_name", {
					number: formatPlate(number ?? String(carId)),
					from: formatDate(dateFrom),
					to: formatDate(dateTo),
				}),
				sheet: t("car.sheet"),
				rows: data.data,
				columns: [
					{ header: t("cars.index"), width: 6, value: (row) => data.data.indexOf(row) + 1 },
					{ header: t("car.detected_at"), width: 14, value: (row) => formatDate(row.detected_at) },
					{ header: t("car.time"), width: 12, value: (row) => formatTime(row.detected_at) },
					{ header: t("car.direction"), width: 12, value: (row) => t(`car.${row.direction}`) },
					{ header: t("cars.photo"), width: 60, value: (row) => row.photo_url },
				],
			})
			message.success({ title: t("export.success") })
		} catch {
			message.error({ title: t("export.error") })
		} finally {
			setLoading(false)
		}
	}

	return { exportExcel: () => void run(), loading }
}
