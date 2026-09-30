// Excel of the dashboard table: every row matching the current filters, not
// just the visible page.

import { useState } from "react"
import { useTranslation } from "react-i18next"
import { client } from "src/shared/api"
import { useMessage } from "src/shared/hooks"
import { exportToExcel } from "src/shared/lib"
import { formatDate, formatDateTime, formatPlate } from "src/shared/utils"
import type { Car } from "src/features/cars/data/cars.keys.ts"
import { useCarsFilters } from "./use-cars-filters.ts"

const EXPORT_LIMIT = 10000

export const useCarsExport = () => {
	const { t } = useTranslation()
	const { message } = useMessage()
	const filters = useCarsFilters()
	const [loading, setLoading] = useState(false)

	const run = async (): Promise<void> => {
		setLoading(true)
		try {
			const { data, error } = await client.GET("/api/v1/cars", {
				params: { query: { ...filters, page: 1, page_size: EXPORT_LIMIT } },
			})
			if (error || !data) throw new Error("export")
			if (!data.data.length) {
				message.info({ title: t("export.empty") })
				return
			}
			await exportToExcel<Car>({
				filename: t("cars.export_name", { from: formatDate(filters.date_from), to: formatDate(filters.date_to) }),
				sheet: t("cars.sheet"),
				rows: data.data,
				columns: [
					{ header: t("cars.index"), width: 6, value: (row) => data.data.indexOf(row) + 1 },
					{ header: t("cars.number"), width: 16, value: (row) => formatPlate(row.number) },
					{ header: t("cars.status"), width: 18, value: (row) => t(`status.${row.status}`) },
					{ header: t("cars.last_seen"), width: 22, value: (row) => formatDateTime(row.last_seen_at) },
					{ header: t("cars.first_seen"), width: 14, value: (row) => formatDate(row.first_seen_at) },
					{ header: t("cars.visits"), width: 10, value: (row) => row.visits_count },
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
