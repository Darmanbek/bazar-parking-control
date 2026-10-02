// Add/edit modal shell driven by the global form-modal store. The feature form
// owns its antd Form and mutation and wraps its fields here. The modal opens
// when a button sets params for its formKey and closes ITSELF once the mutation
// settles successfully (`!loading && success`) — so forms have no open/close props.
// Content mounts on open and is destroyed on close, so a form starts from its
// `initialValues` (derived from the params) every time.

import { Modal, type FormInstance } from "antd"
import type { FC, ReactNode } from "react"
import { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { useResponsive } from "src/shared/hooks"
import { useFormModal } from "src/shared/store"

interface FormModalProps {
	formKey?: string
	form: FormInstance
	title: ReactNode
	loading: boolean
	success: boolean
	okText?: ReactNode
	okDanger?: boolean
	width?: number
	/** Called when the modal is dismissed (to reset the mutation, for example). */
	onClose?: () => void
	children: ReactNode
}

export const FormModal: FC<FormModalProps> = ({
	formKey = "main",
	form,
	title,
	loading,
	success,
	okText,
	okDanger,
	width = 520,
	onClose,
	children,
}) => {
	const { t } = useTranslation()
	const { isMobile } = useResponsive()
	const { open, close } = useFormModal(formKey)

	const handleClose = (): void => {
		close()
		onClose?.()
	}

	// Keyed on the mutation state only, not on `open`: a success left over from
	// the previous submit must not close the modal the moment it reopens.
	useEffect(() => {
		if (open && !loading && success) handleClose()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [loading, success])

	return (
		<Modal
			open={open}
			title={title}
			onCancel={handleClose}
			onOk={() => form.submit()}
			confirmLoading={loading}
			okText={okText ?? t("common.save")}
			okButtonProps={{ danger: okDanger }}
			cancelText={t("common.cancel")}
			width={isMobile ? "100%" : width}
			destroyOnHidden={true}
			mask={{ closable: false }}
		>
			{children}
		</Modal>
	)
}
