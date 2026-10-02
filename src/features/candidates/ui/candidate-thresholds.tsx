// K and N (§6, §7.9). The inspector may only RAISE them: a value under the
// server floor is not rejected but lifted to it, and the fields are redrawn from
// the APPLIED values of meta.thresholds after every answer. The page remounts
// this component when those change (its `key`), so the inputs start from them.

import { Alert, Button, Card, Flex, Form, InputNumber, Typography } from "antd"
import type { FC } from "react"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useSearchParams } from "src/shared/hooks"
import type { Thresholds } from "src/features/candidates/data/candidates.keys.ts"

interface CandidateThresholdsProps {
	applied: Thresholds | undefined
	/** What the URL asked for, to tell the inspector when the server raised it. */
	requested: { min_days?: number; min_visits?: number }
	/** Fallbacks from GET me while the first answer is on its way. */
	floor: { days: number; visits: number; window: number }
}

export const CandidateThresholds: FC<CandidateThresholdsProps> = ({ applied, requested, floor }) => {
	const { t } = useTranslation()
	const { setFilters } = useSearchParams()
	const [minDays, setMinDays] = useState<number | null>(applied?.min_days ?? requested.min_days ?? floor.days)
	const [minVisits, setMinVisits] = useState<number | null>(applied?.min_visits ?? requested.min_visits ?? floor.visits)

	const floorDays = applied?.floor_min_days ?? floor.days
	const floorVisits = applied?.floor_min_visits ?? floor.visits
	const windowDays = applied?.window_days ?? floor.window

	const raised =
		applied &&
		((requested.min_days !== undefined && requested.min_days < applied.min_days) ||
			(requested.min_visits !== undefined && requested.min_visits < applied.min_visits))

	return (
		<Card
			size={"small"}
			styles={{ body: { padding: 16 } }}
		>
			<Flex
				vertical={true}
				gap={12}
			>
				<Typography.Text type={"secondary"}>{t("candidates.subtitle")}</Typography.Text>
				<Form
					layout={"inline"}
					onFinish={() => setFilters({ min_days: minDays ?? undefined, min_visits: minVisits ?? undefined })}
					style={{ rowGap: 8 }}
				>
					<Form.Item label={t("candidates.min_days")}>
						<InputNumber
							min={1}
							max={windowDays}
							precision={0}
							value={minDays}
							onChange={setMinDays}
							style={{ width: 90 }}
						/>
					</Form.Item>
					<Form.Item label={t("candidates.min_visits")}>
						<InputNumber
							min={1}
							precision={0}
							value={minVisits}
							onChange={setMinVisits}
							style={{ width: 90 }}
						/>
					</Form.Item>
					<Form.Item>
						<Button
							type={"primary"}
							htmlType={"submit"}
						>
							{t("candidates.apply")}
						</Button>
					</Form.Item>
				</Form>
				<Typography.Text
					type={"secondary"}
					style={{ fontSize: 12 }}
				>
					{t("candidates.floor_hint", { days: floorDays, visits: floorVisits })}{" "}
					{t("candidates.window", { days: windowDays })}
				</Typography.Text>
				{raised ? (
					<Alert
						type={"info"}
						showIcon={true}
						title={t("candidates.raised", { days: applied.min_days, visits: applied.min_visits })}
					/>
				) : null}
			</Flex>
		</Card>
	)
}
