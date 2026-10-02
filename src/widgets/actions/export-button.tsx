// Server-side xlsx export (§7.12): fetched with the token as a Blob and handed
// to the browser under a name the front end chooses (§5.5) — Content-Disposition
// may be hidden by CORS. Every export is an audited read; nothing is kept.

import { FileExcelOutlined } from "@ant-design/icons"
import { Button } from "antd"
import type { FC } from "react"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { fetchBlob } from "src/shared/api"
import { useMessage } from "src/shared/hooks"
import { getErrorMessage } from "src/shared/lib"
import { downloadBlob } from "src/shared/utils"

type ExportTarget =
	| { path: "/exports/passes"; params: Parameters<typeof fetchBlob<"/exports/passes">>[1] }
	| { path: "/exports/candidates"; params: Parameters<typeof fetchBlob<"/exports/candidates">>[1] }

type ExportButtonProps = ExportTarget & {
	/** Without the extension. */
	filename: string
	disabled?: boolean
}

export const ExportButton: FC<ExportButtonProps> = ({ path, params, filename, disabled }) => {
	const { t } = useTranslation()
	const { message } = useMessage()
	const [loading, setLoading] = useState(false)

	const download = async (): Promise<void> => {
		setLoading(true)
		try {
			const blob = await fetchBlob(path, params as never)
			downloadBlob(blob, `${filename}.xlsx`)
		} catch (error) {
			message.error({ title: t("errors.export_failed"), description: getErrorMessage(error, t("errors.server")) })
		} finally {
			setLoading(false)
		}
	}

	return (
		<Button
			icon={<FileExcelOutlined />}
			loading={loading}
			disabled={disabled}
			onClick={() => void download()}
		>
			{t("common.export")}
		</Button>
	)
}
