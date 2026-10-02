// One contract of the route: carrier, period, quota and its assignments.
// A contract is never edited (they come only from Excel, §7.2); numbers are
// added to it while it has not ended.

import { Card, Flex, Tag, Typography } from "antd"
import type { FC } from "react"
import { useTranslation } from "react-i18next"
import { formatDate } from "src/shared/utils"
import { AddButton } from "src/widgets/actions"
import {
	ASSIGNMENT_ADD_FORM,
	type AssignmentAddParams,
	type RouteContract,
} from "src/features/route/data/route.keys.ts"
import { assignmentState, contractState } from "src/features/route/utils/assignment-state.ts"
import { AssignmentsTable } from "./tables/assignments.table.tsx"

interface ContractCardProps {
	contract: RouteContract
	routeNumber: string
	today: string
	filter?: string
}

export const ContractCard: FC<ContractCardProps> = ({ contract, routeNumber, today, filter }) => {
	const { t } = useTranslation()
	const state = contractState(contract, today)
	const assigned = contract.assignments.filter((a) => {
		const s = assignmentState(a, today)
		return s === "active" || s === "closing"
	}).length
	const params: AssignmentAddParams = { contract, routeNumber }

	return (
		<Card
			size={"small"}
			style={{ opacity: state === "past" ? 0.75 : 1 }}
			title={
				<Flex
					align={"center"}
					gap={10}
					wrap={"wrap"}
					style={{ paddingBlock: 6 }}
				>
					<Typography.Text strong={true}>{contract.carrier}</Typography.Text>
					{state === "current" ? (
						<Tag color={"success"}>{t("route.contract_current")}</Tag>
					) : state === "future" ? (
						<Tag color={"processing"}>{t("route.contract_future", { date: formatDate(contract.valid_from) })}</Tag>
					) : (
						<Tag>{t("route.contract_past")}</Tag>
					)}
					<Typography.Text
						type={"secondary"}
						className={"mono-num"}
					>
						{t("route.period", { from: formatDate(contract.valid_from), until: formatDate(contract.valid_until) })}
					</Typography.Text>
					<Tag color={assigned > contract.quota ? "orange" : "default"}>
						{t("route.quota", { quota: contract.quota })} · {t("day.assigned")}: {assigned}
					</Tag>
				</Flex>
			}
			extra={
				state === "past" ? null : (
					<AddButton
						formKey={ASSIGNMENT_ADD_FORM}
						params={params}
						label={t("route.add")}
						size={"small"}
					/>
				)
			}
		>
			<AssignmentsTable
				assignments={contract.assignments}
				routeNumber={routeNumber}
				today={today}
				filter={filter}
			/>
		</Card>
	)
}
