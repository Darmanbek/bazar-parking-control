// "Find a car" in the header: type part of a plate, pick it, land on its page.
// Searches all of history (no date window), unlike the dashboard's table filter,
// which only narrows the rows of the chosen period.

import { SearchOutlined } from "@ant-design/icons"
import { keepPreviousData } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { AutoComplete, Flex, Input, Spin } from "antd"
import type { FC } from "react"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useDebounce } from "use-debounce"
import { $api } from "src/shared/api"
import { PlateNumber } from "src/shared/ui"
import { formatDateTime } from "src/shared/utils"
import { CarStatusTag } from "./car-status.tsx"

export const CarSearch: FC<{ width?: number | string }> = ({ width = 340 }) => {
	const { t } = useTranslation()
	const navigate = useNavigate()
	const [text, setText] = useState("")
	const [search] = useDebounce(text.replace(/\s+/g, ""), 300)

	const query = $api.useQuery(
		"get",
		"/api/v1/cars",
		{ params: { query: { search, page: 1, page_size: 8 } } },
		{ enabled: search.length >= 2, placeholderData: keepPreviousData, meta: { silent: true } }
	)

	const options =
		search.length >= 2
			? (query.data?.data ?? []).map((car) => ({
					value: String(car.id),
					label: (
						<Flex
							justify={"space-between"}
							align={"center"}
							gap={12}
							style={{ paddingBlock: 4 }}
						>
							<PlateNumber
								number={car.number}
								size={"small"}
							/>
							<Flex
								vertical={true}
								align={"flex-end"}
								gap={2}
							>
								<CarStatusTag status={car.status} />
								<span style={{ fontSize: 11, opacity: 0.6 }}>{formatDateTime(car.last_seen_at)}</span>
							</Flex>
						</Flex>
					),
				}))
			: []

	return (
		<AutoComplete
			value={text}
			options={options}
			onSearch={setText}
			onSelect={(carId: string) => {
				setText("")
				void navigate({ to: "/cars/$carId", params: { carId } })
			}}
			notFoundContent={search.length >= 2 ? query.isFetching ? <Spin size={"small"} /> : t("search.empty") : null}
			popupMatchSelectWidth={true}
			style={{ width, maxWidth: "100%" }}
		>
			<Input
				prefix={<SearchOutlined style={{ opacity: 0.55 }} />}
				placeholder={t("search.placeholder")}
				allowClear={true}
			/>
		</AutoComplete>
	)
}
