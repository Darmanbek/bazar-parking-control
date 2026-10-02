// The visible history of corrections (A2): every retroactive change of a plate,
// who made it and how many visits it recomputed.

import { Flex, Typography } from "antd"
import type { FC } from "react"
import { useTranslation } from "react-i18next"
import type { Schemas } from "src/shared/api"
import { formatDateTime, formatPlate } from "src/shared/utils"

interface CorrectionsListProps {
	corrections: Schemas["Correction"][]
	currentPlate: string
}

export const CorrectionsList: FC<CorrectionsListProps> = ({ corrections, currentPlate }) => {
	const { t } = useTranslation()
	// Each correction replaced `previous_plate` by the plate of the next one (or
	// the current plate for the latest).
	const ordered = [...corrections].sort((a, b) => a.corrected_at.localeCompare(b.corrected_at))

	return (
		<Flex
			vertical={true}
			gap={6}
			style={{ padding: "4px 8px" }}
		>
			<Typography.Text type={"secondary"}>{t("route.corrections")}</Typography.Text>
			{ordered.map((c, i) => (
				<div key={c.corrected_at}>
					<Typography.Text className={"mono-num"}>
						{t("route.correction_line", {
							date: formatDateTime(c.corrected_at),
							who: c.corrected_by,
							from: formatPlate(c.previous_plate),
							to: formatPlate(ordered[i + 1]?.previous_plate ?? currentPlate),
							count: c.recomputed_visits_count,
						})}
					</Typography.Text>
					{c.reason ? (
						<Typography.Text
							type={"secondary"}
							style={{ display: "block", fontSize: 12 }}
						>
							{c.reason}
						</Typography.Text>
					) : null}
				</div>
			))}
		</Flex>
	)
}
