// "Реестр" (§9 step 4): routes and their current contracts. Routes and
// contracts are created only by an Excel import (§7.2) — hence the link to it.

import { UploadOutlined } from "@ant-design/icons"
import { Link } from "@tanstack/react-router"
import { Button } from "antd"
import type { FC } from "react"
import { useTranslation } from "react-i18next"
import { useSearchParams, useViewWindow } from "src/shared/hooks"
import { DayFilter, PageHeader } from "src/widgets/shared"
import { RoutesTable } from "./tables/routes.table.tsx"

export const RegistryPage: FC = () => {
	const { t } = useTranslation()
	const { search } = useSearchParams()
	const window = useViewWindow()
	// Absent = today, the API's own default; only a day inside the window is sent.
	const date = search.date && window.contains(search.date) ? search.date : undefined

	return (
		<>
			<PageHeader
				title={t("registry.title")}
				subtitle={t("registry.subtitle")}
				extra={
					<>
						<DayFilter
							value={date ?? window.today}
							max={"today"}
						/>
						<Link to={"/import"}>
							<Button icon={<UploadOutlined />}>{t("nav.import")}</Button>
						</Link>
					</>
				}
			/>
			<RoutesTable date={date} />
		</>
	)
}
