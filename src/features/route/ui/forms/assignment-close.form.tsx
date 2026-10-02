// "Закрыть с даты" (§7.6). The date asked for is `until` — EXCLUSIVE, the first
// day the plate no longer applies — so the form spells out the last day it
// still does. `until` = today applies from 00:00 today and turns today's visits
// into "Muddati o'tgan": warned about explicitly.

import { Alert, DatePicker, Form, Typography } from "antd"
import dayjs, { type Dayjs } from "dayjs"
import type { FC } from "react"
import { useTranslation } from "react-i18next"
import { $api } from "src/shared/api"
import { useViewWindow } from "src/shared/hooks"
import { fieldErrors } from "src/shared/lib"
import { useFormModal } from "src/shared/store"
import { API_DATE_FORMAT, DATE_FORMAT, assignmentLastDay, formatDate, formatPlate, shiftDate } from "src/shared/utils"
import { FormModal } from "src/widgets/form-modal"
import {
	ASSIGNMENT_CLOSE_FORM,
	type AssignmentEditParams,
	ROUTE_KEY,
	ROUTES_KEY,
} from "src/features/route/data/route.keys.ts"

interface CloseFields {
	until: Dayjs
}

export const AssignmentCloseForm: FC = () => {
	const { t } = useTranslation()
	const { today } = useViewWindow()
	const [form] = Form.useForm<CloseFields>()
	const { params } = useFormModal<AssignmentEditParams>(ASSIGNMENT_CLOSE_FORM)
	const assignment = params?.assignment
	const until = Form.useWatch("until", form)

	const close = $api.useMutation("post", "/assignments/{id}/close", {
		meta: { invalidate: [ROUTE_KEY, ROUTES_KEY], success: {} },
		onError: (error) => form.setFields(fieldErrors(error).map((f) => ({ ...f, name: f.name as keyof CloseFields }))),
	})

	// Not before today, and strictly after `from`.
	const minUntil = assignment && shiftDate(assignment.from, 1) > today ? shiftDate(assignment.from, 1) : today
	const untilDay = until?.format(API_DATE_FORMAT)

	return (
		<FormModal
			formKey={ASSIGNMENT_CLOSE_FORM}
			form={form}
			title={t("assignment.close_title", { plate: assignment ? formatPlate(assignment.plate) : "" })}
			loading={close.isPending}
			success={close.isSuccess}
			okText={t("route.close")}
			okDanger={true}
			onClose={() => close.reset()}
		>
			<Form<CloseFields>
				form={form}
				layout={"vertical"}
				requiredMark={false}
				// Tomorrow by default: keeps today's visits as they are.
				initialValues={{ until: dayjs(minUntil > today ? minUntil : shiftDate(today, 1)) }}
				onFinish={(values) => {
					if (!assignment) return
					close.mutate({
						params: { path: { id: assignment.id } },
						body: { until: values.until.format(API_DATE_FORMAT) },
					})
				}}
			>
				<Form.Item<CloseFields>
					name={"until"}
					label={t("assignment.until")}
					rules={[{ required: true, message: t("assignment.until_required") }]}
					extra={
						untilDay ? (
							<Typography.Text type={"secondary"}>
								{t("assignment.until_hint", { date: formatDate(assignmentLastDay(untilDay)) })}
							</Typography.Text>
						) : null
					}
				>
					<DatePicker
						format={DATE_FORMAT}
						allowClear={false}
						disabledDate={(d) => d.format(API_DATE_FORMAT) < minUntil}
						style={{ width: "100%" }}
					/>
				</Form.Item>
			</Form>
			{untilDay === today ? (
				<Alert
					type={"warning"}
					showIcon={true}
					title={t("assignment.until_today_warning")}
				/>
			) : null}
		</FormModal>
	)
}
