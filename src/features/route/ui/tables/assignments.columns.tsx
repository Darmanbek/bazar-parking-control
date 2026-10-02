import { EditOutlined, StopOutlined } from "@ant-design/icons"
import { Flex, Tag, Tooltip } from "antd"
import type { ColumnsType } from "antd/es/table/interface"
import { useTranslation } from "react-i18next"
import { PlateNumber } from "src/shared/ui"
import { assignmentLastDay, formatDate, formatPlate } from "src/shared/utils"
import { FormButton } from "src/widgets/actions"
import {
	ASSIGNMENT_CLOSE_FORM,
	ASSIGNMENT_CORRECT_FORM,
	type AssignmentEditParams,
	type AssignmentItem,
} from "src/features/route/data/route.keys.ts"
import { assignmentState, type AssignmentState } from "src/features/route/utils/assignment-state.ts"

const STATE_COLOR: Record<AssignmentState, string> = {
	active: "success",
	closing: "warning",
	future: "processing",
	closed: "default",
	empty: "default",
}

export const useAssignmentsColumns = (routeNumber: string, today: string): ColumnsType<AssignmentItem> => {
	const { t } = useTranslation()

	const stateLabel = (row: AssignmentItem, state: AssignmentState) => {
		switch (state) {
			case "active":
				return t("route.state_active")
			case "closing":
				// The last day it applies, as in the "until" column (until is exclusive).
				return t("route.state_closing", { date: formatDate(row.until ? assignmentLastDay(row.until) : null) })
			case "future":
				return t("route.state_future", { date: formatDate(row.from) })
			case "empty":
				return t("route.state_empty")
			default:
				return t("route.state_closed")
		}
	}

	return [
		{
			title: t("route.plate"),
			dataIndex: "plate",
			key: "plate",
			render: (plate: string, row) => (
				<Flex
					align={"center"}
					gap={8}
					wrap={"wrap"}
				>
					<PlateNumber number={plate} />
					{row.original_plate !== plate || row.corrections.length ? (
						<Tooltip title={t("route.original_plate", { plate: formatPlate(row.original_plate) })}>
							<Tag color={"purple"}>{t("route.corrected")}</Tag>
						</Tooltip>
					) : null}
				</Flex>
			),
		},
		{
			title: t("route.from"),
			dataIndex: "from",
			key: "from",
			render: (v: string) => <span className={"mono-num"}>{formatDate(v)}</span>,
		},
		{
			title: t("route.until"),
			dataIndex: "until",
			key: "until",
			// `until` is EXCLUSIVE: people see the last day it still applies (§3.5).
			render: (v: string | null, row) =>
				v === null ? (
					t("route.until_open")
				) : v <= row.from ? (
					"—"
				) : (
					<span className={"mono-num"}>{t("route.until_value", { date: formatDate(assignmentLastDay(v)) })}</span>
				),
		},
		{
			title: t("route.state"),
			key: "state",
			render: (_v, row) => {
				const state = assignmentState(row, today)
				return <Tag color={STATE_COLOR[state]}>{stateLabel(row, state)}</Tag>
			},
		},
		{
			title: t("common.actions"),
			key: "actions",
			width: 110,
			align: "right",
			// No "delete": an assignment is only ever closed (A1, §8).
			render: (_v, row) => {
				const params: AssignmentEditParams = { assignment: row, routeNumber }
				return (
					<Flex
						gap={2}
						justify={"flex-end"}
					>
						{row.until === null ? (
							<FormButton
								formKey={ASSIGNMENT_CLOSE_FORM}
								params={params}
								icon={<StopOutlined />}
								label={t("route.close")}
								danger={true}
							/>
						) : null}
						<FormButton
							formKey={ASSIGNMENT_CORRECT_FORM}
							params={params}
							icon={<EditOutlined />}
							label={t("route.correct")}
						/>
					</Flex>
				)
			},
		},
	]
}
