// One calendar day inside the view window (§5.1), bound to `?date=`. Days in
// Asia/Tashkent. `max` is today for live data and yesterday for candidates,
// which exist only for closed days.

import { Button, DatePicker, Flex } from "antd"
import dayjs, { type Dayjs } from "dayjs"
import type { FC } from "react"
import { useTranslation } from "react-i18next"
import { useSearchParams, useViewWindow } from "src/shared/hooks"
import { API_DATE_FORMAT, DATE_FORMAT } from "src/shared/utils"

interface DayFilterProps {
	/** The day shown; the screen resolves the default. */
	value: string
	max: "today" | "yesterday"
}

export const DayFilter: FC<DayFilterProps> = ({ value, max }) => {
	const { t } = useTranslation()
	const { setFilter } = useSearchParams()
	const window = useViewWindow()
	const maxDate = max === "today" ? window.today : window.yesterday

	const pick = (date: string) => setFilter("date", date)

	return (
		<Flex
			gap={6}
			align={"center"}
			wrap={"wrap"}
		>
			{max === "today" ? (
				<Button
					type={value === window.today ? "primary" : "default"}
					onClick={() => pick(window.today)}
				>
					{t("common.today")}
				</Button>
			) : null}
			<Button
				type={value === window.yesterday ? "primary" : "default"}
				onClick={() => pick(window.yesterday)}
			>
				{t("common.yesterday")}
			</Button>
			<DatePicker
				value={dayjs(value)}
				format={DATE_FORMAT}
				allowClear={false}
				disabledDate={(d: Dayjs) => {
					const day = d.format(API_DATE_FORMAT)
					return day < window.minDate || day > maxDate
				}}
				onChange={(d) => d && pick(d.format(API_DATE_FORMAT))}
				style={{ width: 150 }}
				aria-label={t("common.date")}
			/>
		</Flex>
	)
}
