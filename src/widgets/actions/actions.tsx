// Generic toolbar/row action buttons, so features never re-style these one-offs.

import { ArrowLeftOutlined, EyeOutlined, FileExcelOutlined, ReloadOutlined } from "@ant-design/icons"
import { Button, Tooltip } from "antd"
import type { FC } from "react"
import { useTranslation } from "react-i18next"

export const RefetchButton: FC<{ onClick: () => void; loading?: boolean }> = ({ onClick, loading }) => {
	const { t } = useTranslation()
	return (
		<Tooltip title={t("common.refresh")}>
			<Button
				icon={<ReloadOutlined spin={loading} />}
				onClick={onClick}
				aria-label={t("common.refresh")}
			/>
		</Tooltip>
	)
}

export const ExcelButton: FC<{ onClick: () => void; loading?: boolean; disabled?: boolean }> = ({
	onClick,
	loading,
	disabled,
}) => {
	const { t } = useTranslation()
	return (
		<Button
			icon={<FileExcelOutlined />}
			loading={loading}
			disabled={disabled}
			onClick={onClick}
		>
			{t("common.excel")}
		</Button>
	)
}

export const OpenButton: FC<{ onClick: () => void }> = ({ onClick }) => {
	const { t } = useTranslation()
	return (
		<Tooltip title={t("common.open")}>
			<Button
				type={"text"}
				icon={<EyeOutlined />}
				onClick={onClick}
				aria-label={t("common.open")}
			/>
		</Tooltip>
	)
}

export const BackButton: FC<{ onClick: () => void }> = ({ onClick }) => {
	const { t } = useTranslation()
	return (
		<Button
			icon={<ArrowLeftOutlined />}
			onClick={onClick}
		>
			{t("common.back")}
		</Button>
	)
}
