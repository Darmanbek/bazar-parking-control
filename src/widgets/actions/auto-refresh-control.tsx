// Live-polling switch + period picker. The queries read the same store through
// useRefetchInterval. Periods start at one minute: every read is audited (§5.4).

import { Flex, Select, Switch, Tooltip, Typography } from "antd"
import type { FC } from "react"
import { useTranslation } from "react-i18next"
import { REFRESH_INTERVALS } from "src/shared/config"
import { useAutoRefreshStore } from "src/shared/store"

export const AutoRefreshControl: FC<{ disabled?: boolean; disabledReason?: string }> = ({
	disabled,
	disabledReason,
}) => {
	const { t } = useTranslation()
	const { enabled, interval, setEnabled, setInterval } = useAutoRefreshStore()
	const live = enabled && !disabled

	return (
		<Tooltip title={disabled ? disabledReason : undefined}>
			<Flex
				align={"center"}
				gap={8}
			>
				<span
					className={"live-dot"}
					data-paused={!live}
					aria-hidden={true}
				/>
				<Typography.Text style={{ whiteSpace: "nowrap" }}>{t("refresh.auto")}</Typography.Text>
				<Switch
					size={"small"}
					checked={live}
					disabled={disabled}
					onChange={setEnabled}
					aria-label={t("refresh.auto")}
				/>
				<Select
					size={"small"}
					value={interval}
					disabled={!live}
					onChange={setInterval}
					popupMatchSelectWidth={false}
					options={REFRESH_INTERVALS.map((ms) => ({ value: ms, label: t("refresh.every", { minutes: ms / 60_000 }) }))}
					style={{ width: 120 }}
				/>
			</Flex>
		</Tooltip>
	)
}
