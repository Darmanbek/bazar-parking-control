// Step 1: send the ministry's .xlsx (§7.3). A successful upload REPLACES any
// earlier unconfirmed preview of this inspector; a failed one leaves it alone.
// Upload errors are told by `reason`, never by text (the wrapper maps them).

import { InboxOutlined } from "@ant-design/icons"
import { Card, Upload } from "antd"
import type { FC } from "react"
import { useTranslation } from "react-i18next"
import { $api } from "src/shared/api"
import { useSearchParams } from "src/shared/hooks"

export const ImportUpload: FC = () => {
	const { t } = useTranslation()
	const { setParams } = useSearchParams()

	const upload = $api.useMutation("post", "/registry/imports", {
		onSuccess: (response) => setParams({ import_id: response.data.id }),
	})

	return (
		<Card>
			<Upload.Dragger
				accept={".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}
				multiple={false}
				showUploadList={false}
				disabled={upload.isPending}
				beforeUpload={(file) => {
					upload.mutate({
						body: { file: file as unknown as string },
						bodySerializer: (body: { file: string }) => {
							const data = new FormData()
							data.append("file", body.file as unknown as Blob)
							return data
						},
					})
					// The request is ours; antd must not send the file itself.
					return false
				}}
			>
				<p className={"ant-upload-drag-icon"}>
					<InboxOutlined />
				</p>
				<p className={"ant-upload-text"}>{upload.isPending ? "…" : t("import.drop")}</p>
				<p className={"ant-upload-hint"}>{t("import.drop_hint")}</p>
			</Upload.Dragger>
		</Card>
	)
}
