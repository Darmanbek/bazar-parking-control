// Every detection of one car in the chosen window, newest first.

import { HistoryOutlined } from "@ant-design/icons"
import type { UseQueryResult } from "@tanstack/react-query"
import { Flex, Typography } from "antd"
import type { FC } from "react"
import { useTranslation } from "react-i18next"
import type { Schemas } from "src/shared/api"
import type { PaginationState } from "src/shared/hooks"
import { Table } from "src/shared/ui"
import { ExcelButton } from "src/widgets/actions"
import type { CarEvent } from "src/features/car/data/car.keys.ts"
import { useCarHistoryColumns } from "./car-history.columns.tsx"

interface CarHistoryTableProps {
	// The query lives in the page: its total also feeds the summary card.
	query: UseQueryResult<Schemas["CarEventsPage"]>
	pagination: PaginationState & { onChange: (current: number, pageSize: number) => void }
	onExport: () => void
	exporting: boolean
}

export const CarHistoryTable: FC<CarHistoryTableProps> = ({ query, pagination, onExport, exporting }) => {
	const { t } = useTranslation()
	const columns = useCarHistoryColumns(pagination)

	return (
		<Table<CarEvent>
			title={
				<Flex
					align={"center"}
					gap={8}
				>
					<HistoryOutlined style={{ fontSize: 18 }} />
					<Typography.Title
						level={5}
						style={{ margin: 0 }}
					>
						{t("car.history")}
					</Typography.Title>
				</Flex>
			}
			extra={
				<ExcelButton
					onClick={onExport}
					loading={exporting}
					disabled={!query.data?.meta.total}
				/>
			}
			columns={columns}
			dataSource={query.data?.data ?? []}
			loading={query.isPending || query.isPlaceholderData}
			pagination={{
				current: pagination.current,
				pageSize: pagination.pageSize,
				total: query.data?.meta.total ?? 0,
				onChange: pagination.onChange,
			}}
		/>
	)
}
