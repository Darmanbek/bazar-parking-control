// Licence status as a tag, the one domain fact both pages colour.

import { CheckCircleFilled, CloseCircleFilled } from "@ant-design/icons"
import { Tag } from "antd"
import type { FC } from "react"
import { useTranslation } from "react-i18next"
import type { Schemas } from "src/shared/api"

type LicenseStatus = Schemas["LicenseStatus"]

export const CarStatusTag: FC<{ status: LicenseStatus }> = ({ status }) => {
	const { t } = useTranslation()
	const licensed = status === "licensed"
	return (
		<Tag
			color={licensed ? "success" : "error"}
			icon={licensed ? <CheckCircleFilled /> : <CloseCircleFilled />}
			style={{ fontWeight: 600, marginInlineEnd: 0 }}
		>
			{t(`status.${status}`)}
		</Tag>
	)
}
