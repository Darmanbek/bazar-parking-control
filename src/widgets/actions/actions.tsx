// Generic toolbar/row action buttons, so features never re-style these one-offs.

import { ArrowLeftOutlined, EyeOutlined, PlusOutlined, ReloadOutlined } from "@ant-design/icons"
import { Button, Tooltip } from "antd"
import type { FC, ReactNode } from "react"
import { useTranslation } from "react-i18next"
import { useFormDevtoolsStore } from "src/shared/store"

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

/** Opens the form registered under `formKey`, handing it `params` (FormModal recipe). */
export const AddButton: FC<{ formKey?: string; params?: unknown; label: ReactNode; size?: "small" | "middle" }> = ({
	formKey = "main",
	params = null,
	label,
	size,
}) => {
	const setParams = useFormDevtoolsStore((s) => s.setParams)
	return (
		<Button
			type={"primary"}
			size={size}
			icon={<PlusOutlined />}
			onClick={() => setParams(params, formKey)}
		>
			{label}
		</Button>
	)
}

/** A row action that opens a form modal: an icon with a tooltip. */
export const FormButton: FC<{
	formKey: string
	params: unknown
	icon: ReactNode
	label: string
	danger?: boolean
}> = ({ formKey, params, icon, label, danger }) => {
	const setParams = useFormDevtoolsStore((s) => s.setParams)
	return (
		<Tooltip title={label}>
			<Button
				type={"text"}
				danger={danger}
				icon={icon}
				aria-label={label}
				onClick={() => setParams(params, formKey)}
			/>
		</Tooltip>
	)
}
