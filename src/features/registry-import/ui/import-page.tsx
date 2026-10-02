// "Загрузка Excel" (§9 step 6): upload → preview → confirm. The preview id lives
// in the URL so a reload returns to it while it is alive.

import type { FC } from "react"
import { useTranslation } from "react-i18next"
import { useSearchParams } from "src/shared/hooks"
import { PageHeader } from "src/widgets/shared"
import { ImportPreview } from "./import-preview.tsx"
import { ImportUpload } from "./import-upload.tsx"

export const ImportPage: FC = () => {
	const { t } = useTranslation()
	const { search } = useSearchParams()

	return (
		<>
			<PageHeader
				title={t("import.title")}
				subtitle={t("import.subtitle")}
			/>
			{search.import_id ? (
				<ImportPreview
					key={search.import_id}
					id={search.import_id}
				/>
			) : (
				<ImportUpload />
			)}
		</>
	)
}
