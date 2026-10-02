// A candidate's visits by day (the expandable row of §7.9): one bar per day,
// filled when that day reached N. Only days inside the view window exist here.

import { Flex, Tooltip, Typography } from "antd"
import type { FC } from "react"
import { useTranslation } from "react-i18next"
import { useToken } from "src/shared/hooks"
import { formatDate } from "src/shared/utils"
import type { Candidate } from "src/features/candidates/data/candidates.keys.ts"

const BAR_HEIGHT = 56

export const CandidateDays: FC<{ days: Candidate["days"] }> = ({ days }) => {
	const { t } = useTranslation()
	const { token } = useToken()
	const sorted = [...days].sort((a, b) => a.date.localeCompare(b.date))
	const max = Math.max(1, ...sorted.map((d) => d.visits_count))

	return (
		<Flex
			vertical={true}
			gap={8}
			style={{ padding: "4px 8px" }}
		>
			<Typography.Text type={"secondary"}>{t("candidates.days")}</Typography.Text>
			<Flex
				gap={4}
				align={"flex-end"}
				style={{ overflowX: "auto", paddingBottom: 4 }}
			>
				{sorted.map((day) => (
					<Tooltip
						key={day.date}
						title={`${formatDate(day.date)}: ${day.visits_count}`}
					>
						<Flex
							vertical={true}
							align={"center"}
							gap={4}
							style={{ minWidth: 26 }}
						>
							<span
								className={"mono-num"}
								style={{ fontSize: 11 }}
							>
								{day.visits_count}
							</span>
							<span
								style={{
									width: 18,
									height: Math.max(4, (day.visits_count / max) * BAR_HEIGHT),
									borderRadius: 4,
									background: day.qualifies ? token.colorPrimary : token.colorFillSecondary,
								}}
							/>
							<span style={{ fontSize: 10, opacity: 0.6 }}>{formatDate(day.date).slice(0, 5)}</span>
						</Flex>
					</Tooltip>
				))}
			</Flex>
		</Flex>
	)
}
