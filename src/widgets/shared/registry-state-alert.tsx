// "Реестр не велся" (§3.2): a day before the first registry import has no
// verdicts at all. It is a state of the day, not an empty result, so it gets
// its own banner instead of "no passes".

import { Alert } from "antd"
import type { FC } from "react"
import { useTranslation } from "react-i18next"
import type { Schemas } from "src/shared/api"
import { useMe } from "src/shared/hooks"
import { formatDate } from "src/shared/utils"

export const RegistryStateAlert: FC<{ state: Schemas["RegistryState"] | undefined }> = ({ state }) => {
	const { t } = useTranslation()
	const me = useMe()
	if (state !== "not_maintained") return null

	const first = me.data?.registry.first_import_date
	return (
		<Alert
			type={"warning"}
			showIcon={true}
			title={t("state.registry_not_maintained")}
			description={
				<>
					{t("state.registry_not_maintained_hint")}{" "}
					{first ? t("state.first_import", { date: formatDate(first) }) : t("state.no_import_yet")}
				</>
			}
		/>
	)
}
