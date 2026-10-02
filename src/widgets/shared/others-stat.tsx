// "Остальные" (A10): visits of plates that are neither in the registry nor
// candidates exist on screen only as numbers — never a plate, never a photo.

import { Flex, Typography } from "antd"
import type { FC } from "react"
import { useTranslation } from "react-i18next"
import type { Schemas } from "src/shared/api"

export const OthersStat: FC<{ others: Schemas["Others"] | null | undefined }> = ({ others }) => {
	const { t } = useTranslation()
	if (!others) return null

	return (
		<Flex
			gap={8}
			wrap={"wrap"}
			align={"baseline"}
		>
			<Typography.Text type={"secondary"}>{t("others.title")}:</Typography.Text>
			<Typography.Text
				strong={true}
				className={"mono-num"}
			>
				{t("others.visits", { count: others.visits_count })}
			</Typography.Text>
			<Typography.Text
				type={"secondary"}
				className={"mono-num"}
			>
				· {t("others.plates", { count: others.plates_count })}
			</Typography.Text>
		</Flex>
	)
}
