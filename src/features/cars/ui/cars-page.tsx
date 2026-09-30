// The dashboard (the sketch): three counters over the cars table.

import type { FC } from "react"
import { useTranslation } from "react-i18next"
import { AutoRefreshControl, RefetchButton } from "src/widgets/actions"
import { DateRangeFilter, PageHeader } from "src/widgets/shared"
import { useRefreshCars } from "src/features/cars/hooks/use-refresh-cars.ts"
import { CarsStats } from "./cars-stats.tsx"
import { CarsTable } from "./tables/cars.table.tsx"

export const CarsPage: FC = () => {
	const { t } = useTranslation()
	const { refresh, fetching } = useRefreshCars()

	return (
		<>
			<PageHeader
				title={t("cars.title")}
				extra={
					<>
						<AutoRefreshControl />
						<DateRangeFilter />
						<RefetchButton
							onClick={refresh}
							loading={fetching}
						/>
					</>
				}
			/>
			<CarsStats />
			<CarsTable />
		</>
	)
}
