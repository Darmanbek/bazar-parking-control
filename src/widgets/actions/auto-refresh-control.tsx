// Live-polling switch + period picker. The queries read the same store through
// useRefetchInterval, so this control never needs to know which ones they are.

import { Flex, Select, Switch, Typography } from "antd"
import type { FC } from "react"
import { useTranslation } from "react-i18next"
import { REFRESH_INTERVALS } from "src/shared/config"
import { useAutoRefreshStore } from "src/shared/store"

export const AutoRefreshControl: FC = () => {
	const { t } = useTranslation()
	const { enabled, interval, setEnabled, setInterval } = useAutoRefreshStore()

	return (
		<Flex
			align={"center"}
			gap={8}
		>
			<span
				className={"live-dot"}
				data-paused={!enabled}
				aria-hidden={true}
			/>
			<Typography.Text style={{ whiteSpace: "nowrap" }}>{t("refresh.auto")}</Typography.Text>
			<Switch
				size={"small"}
				checked={enabled}
				onChange={setEnabled}
				aria-label={t("refresh.auto")}
			/>
			<Select
				size={"small"}
				value={interval}
				disabled={!enabled}
				onChange={setInterval}
				popupMatchSelectWidth={false}
				options={REFRESH_INTERVALS.map((ms) => ({ value: ms, label: t("refresh.every", { seconds: ms / 1000 }) }))}
				style={{ width: 130 }}
			/>
		</Flex>
	)
}
