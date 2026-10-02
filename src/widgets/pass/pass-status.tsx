// Verdict of a visit, drawn from the machine key (§3.1) — never from text.
// Labels are the TZ's Uzbek ones; a candidate gets its own neutral caption
// "Reyestrda yo'q, takroriy" (A20). No word of the list in §3.3 appears here.

import { CheckCircleFilled, ClockCircleFilled, QuestionCircleFilled, SyncOutlined } from "@ant-design/icons"
import { Flex, Tag, Typography } from "antd"
import type { FC } from "react"
import { useTranslation } from "react-i18next"
import type { Schemas } from "src/shared/api"

type PassStatus = Schemas["PassStatus"]

const STATUS_COLOR: Record<PassStatus, string> = {
	permitted: "success",
	expired: "warning",
	not_in_registry: "default",
}

const STATUS_ICON = {
	permitted: <CheckCircleFilled />,
	expired: <ClockCircleFilled />,
	not_in_registry: <QuestionCircleFilled />,
}

interface PassStatusTagProps {
	status: PassStatus
	expiredReason?: Schemas["ExpiredReason"] | null
	/** A row of GET candidates: "not in the registry, repeating". */
	candidate?: boolean
}

export const PassStatusTag: FC<PassStatusTagProps> = ({ status, expiredReason, candidate }) => {
	const { t } = useTranslation()

	if (candidate) {
		return (
			<Tag
				icon={<SyncOutlined />}
				color={"processing"}
				style={{ fontWeight: 600, marginInlineEnd: 0 }}
			>
				{t("status.candidate")}
			</Tag>
		)
	}

	return (
		<Flex
			vertical={true}
			gap={2}
			align={"flex-start"}
		>
			<Tag
				color={STATUS_COLOR[status]}
				icon={STATUS_ICON[status]}
				style={{ fontWeight: 600, marginInlineEnd: 0 }}
			>
				{t(`status.${status}`)}
			</Tag>
			{status === "expired" && expiredReason ? (
				<Typography.Text
					type={"secondary"}
					style={{ fontSize: 12 }}
				>
					{t(`expired_reason.${expiredReason}`)}
				</Typography.Text>
			) : null}
		</Flex>
	)
}
