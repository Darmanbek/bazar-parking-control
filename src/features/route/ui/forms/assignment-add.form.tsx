// "Добавить номер" (§7.5): a change that applies FORWARD — `from` is today or
// later and inside the contract period. An over-quota add is created with a
// warning, not refused (A4). `plate_conflict` names the route the plate is on.

import { Alert, DatePicker, Form, Input } from "antd"
import dayjs, { type Dayjs } from "dayjs"
import type { FC } from "react"
import { useTranslation } from "react-i18next"
import { $api } from "src/shared/api"
import { useMessage, useViewWindow } from "src/shared/hooks"
import { fieldErrors } from "src/shared/lib"
import { useFormModal } from "src/shared/store"
import { API_DATE_FORMAT, DATE_FORMAT, formatDate } from "src/shared/utils"
import { FormModal } from "src/widgets/form-modal"
import {
	ASSIGNMENT_ADD_FORM,
	type AssignmentAddParams,
	ROUTE_KEY,
	ROUTES_KEY,
} from "src/features/route/data/route.keys.ts"

interface AddFields {
	plate: string
	from: Dayjs
}

export const AssignmentAddForm: FC = () => {
	const { t } = useTranslation()
	const { message } = useMessage()
	const { today } = useViewWindow()
	const [form] = Form.useForm<AddFields>()
	const { params } = useFormModal<AssignmentAddParams>(ASSIGNMENT_ADD_FORM)
	const contract = params?.contract

	const add = $api.useMutation("post", "/assignments", {
		meta: { invalidate: [ROUTE_KEY, ROUTES_KEY], success: {} },
		onSuccess: (response) => {
			for (const w of response.warnings) {
				if (w.code === "quota_exceeded") {
					message.warning({
						title: t("assignment.quota_warning", { assigned: w.assigned_count, quota: w.quota }),
					})
				}
			}
		},
		onError: (error) => form.setFields(fieldErrors(error).map((f) => ({ ...f, name: f.name as keyof AddFields }))),
	})

	// Earliest allowed: today, but never before the contract starts.
	const minFrom = contract && contract.valid_from > today ? contract.valid_from : today

	return (
		<FormModal
			formKey={ASSIGNMENT_ADD_FORM}
			form={form}
			title={t("assignment.add_title", { route: params?.routeNumber ?? "" })}
			loading={add.isPending}
			success={add.isSuccess}
			okText={t("route.add")}
			onClose={() => add.reset()}
		>
			{contract ? (
				<Alert
					type={"info"}
					showIcon={true}
					style={{ marginBottom: 16 }}
					title={`${contract.carrier} · ${t("route.period", {
						from: formatDate(contract.valid_from),
						until: formatDate(contract.valid_until),
					})}`}
				/>
			) : null}
			<Form<AddFields>
				form={form}
				layout={"vertical"}
				requiredMark={false}
				initialValues={{ from: dayjs(minFrom) }}
				onFinish={(values) => {
					if (!contract) return
					add.mutate({
						body: {
							contract_id: contract.id,
							plate: values.plate.trim(),
							from: values.from.format(API_DATE_FORMAT),
						},
					})
				}}
			>
				<Form.Item<AddFields>
					name={"plate"}
					label={t("assignment.plate")}
					extra={t("assignment.plate_hint")}
					rules={[{ required: true, whitespace: true, message: t("assignment.plate_required") }]}
				>
					<Input
						autoFocus={true}
						maxLength={16}
						style={{ fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase" }}
					/>
				</Form.Item>
				<Form.Item<AddFields>
					name={"from"}
					label={t("assignment.from")}
					extra={t("assignment.from_hint")}
					rules={[{ required: true, message: t("assignment.from_required") }]}
				>
					<DatePicker
						format={DATE_FORMAT}
						allowClear={false}
						disabledDate={(d) => {
							const day = d.format(API_DATE_FORMAT)
							return day < minFrom || (contract ? day > contract.valid_until : false)
						}}
						style={{ width: "100%" }}
					/>
				</Form.Item>
			</Form>
		</FormModal>
	)
}
