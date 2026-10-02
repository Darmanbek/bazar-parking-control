// "Исправить номер" (§7.7): a typo fix that applies BACKWARD — past verdicts
// are recomputed, so the form says so before anything is sent. Only a typo is
// allowed: at most 2 characters from the immutable `original_plate`. Past that
// (`plate_difference_too_large`) the way is "close and add a new one".

import { Alert, Flex, Form, Input } from "antd"
import type { FC } from "react"
import { useTranslation } from "react-i18next"
import { $api } from "src/shared/api"
import { useMessage } from "src/shared/hooks"
import { errorCode, fieldErrors } from "src/shared/lib"
import { useFormModal } from "src/shared/store"
import { formatPlate } from "src/shared/utils"
import { FormModal } from "src/widgets/form-modal"
import {
	ASSIGNMENT_CORRECT_FORM,
	type AssignmentEditParams,
	ROUTE_KEY,
	ROUTES_KEY,
} from "src/features/route/data/route.keys.ts"

interface CorrectFields {
	plate: string
	reason?: string
}

export const AssignmentCorrectForm: FC = () => {
	const { t } = useTranslation()
	const { message } = useMessage()
	const [form] = Form.useForm<CorrectFields>()
	const { params } = useFormModal<AssignmentEditParams>(ASSIGNMENT_CORRECT_FORM)
	const assignment = params?.assignment

	const correct = $api.useMutation("post", "/assignments/{id}/correct", {
		meta: { invalidate: [ROUTE_KEY, ROUTES_KEY] },
		onSuccess: ({ correction }) => {
			message.success({
				title: t("assignment.corrected", {
					from: formatPlate(correction.previous_plate),
					to: formatPlate(correction.new_plate),
					count: correction.recomputed_visits_count,
				}),
			})
		},
		onError: (error) => form.setFields(fieldErrors(error).map((f) => ({ ...f, name: f.name as keyof CorrectFields }))),
	})

	const tooFar = errorCode(correct.error) === "plate_difference_too_large"

	return (
		<FormModal
			formKey={ASSIGNMENT_CORRECT_FORM}
			form={form}
			title={t("assignment.correct_title", { plate: assignment ? formatPlate(assignment.plate) : "" })}
			loading={correct.isPending}
			success={correct.isSuccess}
			okText={t("route.correct")}
			okDanger={true}
			onClose={() => correct.reset()}
		>
			<Flex
				vertical={true}
				gap={12}
				style={{ marginBottom: 16 }}
			>
				<Alert
					type={"warning"}
					showIcon={true}
					title={t("assignment.correct_warning")}
					description={
						assignment ? t("assignment.correct_limit", { plate: formatPlate(assignment.original_plate) }) : undefined
					}
				/>
				{tooFar ? (
					<Alert
						type={"error"}
						showIcon={true}
						title={t("assignment.correct_too_far")}
					/>
				) : null}
			</Flex>
			<Form<CorrectFields>
				form={form}
				layout={"vertical"}
				requiredMark={false}
				initialValues={{ plate: assignment?.plate }}
				onFinish={(values) => {
					if (!assignment) return
					correct.mutate({
						params: { path: { id: assignment.id } },
						body: { plate: values.plate.trim(), reason: values.reason?.trim() || undefined },
					})
				}}
			>
				<Form.Item<CorrectFields>
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
				<Form.Item<CorrectFields>
					name={"reason"}
					label={t("assignment.reason")}
				>
					<Input.TextArea
						rows={2}
						maxLength={500}
						showCount={true}
					/>
				</Form.Item>
			</Form>
		</FormModal>
	)
}
