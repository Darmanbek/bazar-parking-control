// The date window of the screen, bound to the URL (`date_from` / `date_to`).
// Quick presets cover what a guard actually asks: today, yesterday, the week.

import { DatePicker } from "antd"
import dayjs, { type Dayjs } from "dayjs"
import type { FC } from "react"
import { useTranslation } from "react-i18next"
import { useDateRange } from "src/shared/hooks"
import { API_DATE_FORMAT, DATE_FORMAT } from "src/shared/utils"

/** `defaultDays` must match what the screen passes to its own useDateRange. */
export const DateRangeFilter: FC<{ defaultDays?: number }> = ({ defaultDays }) => {
	const { t } = useTranslation()
	const { dateFrom, dateTo, setRange } = useDateRange(defaultDays)
	const today = dayjs()

	return (
		<DatePicker.RangePicker
			value={[dayjs(dateFrom), dayjs(dateTo)]}
			format={DATE_FORMAT}
			allowClear={false}
			disabledDate={(d) => d.isAfter(today, "day")}
			presets={[
				{ label: t("date.today"), value: [today, today] },
				{ label: t("date.yesterday"), value: [today.subtract(1, "day"), today.subtract(1, "day")] },
				{ label: t("date.week"), value: [today.subtract(6, "day"), today] },
				{ label: t("date.month"), value: [today.subtract(29, "day"), today] },
			]}
			onChange={(range) => {
				const [from, to] = (range ?? []) as [Dayjs | null, Dayjs | null]
				setRange(from?.format(API_DATE_FORMAT), to?.format(API_DATE_FORMAT))
			}}
			style={{ width: 260 }}
		/>
	)
}
