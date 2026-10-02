// Step 2: the preview and its confirmation (§7.3).
//
// - "Подтвердить" is off while there are errors (`can_confirm: false`) and once
//   `expires_at` has passed; `effective_date` (today) is shown.
// - A preview simply disappears (1 h / end of the Tashkent day / replaced by a
//   new upload): GET or confirm answer 404, or — in an edge case — 409
//   `import_expired`. Both read "outdated, upload again".
// - When rows will be closed or moved, a warning sits above the button:
//   closing from today applies from 00:00 today.
// - A confirmed import has no `rows`: only its summary is shown.

import { CheckCircleOutlined, UploadOutlined } from "@ant-design/icons"
import { Link } from "@tanstack/react-router"
import { Alert, Button, Card, Col, Descriptions, Flex, Result, Row, Skeleton, Statistic } from "antd"
import type { FC } from "react"
import { useTranslation } from "react-i18next"
import { $api } from "src/shared/api"
import { useSearchParams } from "src/shared/hooks"
import { errorCode, errorStatus } from "src/shared/lib"
import { formatDate, formatDateTime } from "src/shared/utils"
import { IMPORT_KEY, type Import, SUMMARY_FIELDS } from "src/features/registry-import/data/import.keys.ts"
import { useCountdown } from "src/features/registry-import/hooks/use-countdown.ts"
import { ImportRowsTable } from "./tables/import-rows.table.tsx"

const SummaryGrid: FC<{ summary: Import["summary"] }> = ({ summary }) => {
	const { t } = useTranslation()
	return (
		<Row gutter={[16, 16]}>
			{SUMMARY_FIELDS.map((field) => (
				<Col
					key={field}
					xs={12}
					sm={8}
					lg={4}
				>
					<Statistic
						title={t(`import.summary.${field}`)}
						value={summary[field]}
						styles={{
							content: {
								fontFamily: "'JetBrains Mono', monospace",
								color:
									field === "errors_count" && summary[field] > 0
										? "#dc2626"
										: field === "warnings_count" && summary[field] > 0
											? "#d97706"
											: undefined,
							},
						}}
					/>
				</Col>
			))}
		</Row>
	)
}

export const ImportPreview: FC<{ id: number }> = ({ id }) => {
	const { t } = useTranslation()
	const { setParams } = useSearchParams()
	const newFile = () => setParams({ import_id: undefined })

	// Silent: a 404 here is "the preview has gone", answered on screen.
	const query = $api.useQuery("get", "/registry/imports/{id}", { params: { path: { id } } }, { meta: { silent: true } })
	const confirm = $api.useMutation("post", "/registry/imports/{id}/confirm", {
		meta: { invalidate: [IMPORT_KEY, ["get", "/routes"]], success: {} },
		// import_already_confirmed: re-read, the screen then shows the result.
		onError: (error) => {
			if (errorCode(error) === "import_already_confirmed") void query.refetch()
		},
	})

	const data = query.data?.data
	const countdown = useCountdown(data?.expires_at)
	// 404 on GET/confirm of our own recent id, or 409 import_expired: start over.
	const gone =
		errorStatus(query.error) === 404 ||
		errorStatus(confirm.error) === 404 ||
		errorCode(confirm.error) === "import_expired"

	if (gone || (data?.status === "previewed" && countdown.expired)) {
		return (
			<Result
				status={"warning"}
				title={t("import.expired")}
				extra={
					<Button
						type={"primary"}
						icon={<UploadOutlined />}
						onClick={newFile}
					>
						{t("import.new_file")}
					</Button>
				}
			/>
		)
	}

	if (!data) {
		return (
			<Card>
				<Skeleton
					active={true}
					paragraph={{ rows: 6 }}
				/>
			</Card>
		)
	}

	if (data.status === "confirmed") {
		return (
			<Card>
				<Result
					status={"success"}
					icon={<CheckCircleOutlined />}
					title={t("import.confirmed", { date: formatDateTime(data.confirmed_at) })}
					subTitle={`${data.file_name} · ${t("import.effective_date")}: ${formatDate(data.effective_date)}`}
					extra={
						<Flex
							gap={8}
							justify={"center"}
						>
							<Link to={"/registry"}>
								<Button type={"primary"}>{t("nav.registry")}</Button>
							</Link>
							<Button onClick={newFile}>{t("import.new_file")}</Button>
						</Flex>
					}
				/>
				<SummaryGrid summary={data.summary} />
			</Card>
		)
	}

	const moves = data.summary.assignments_close + data.summary.assignments_move

	return (
		<>
			<Card>
				<Flex
					vertical={true}
					gap={20}
				>
					<Descriptions
						column={{ xs: 1, sm: 3 }}
						items={[
							{ key: "file", label: t("import.file"), children: data.file_name },
							{
								key: "effective",
								label: t("import.effective_date"),
								children: <strong className={"mono-num"}>{formatDate(data.effective_date)}</strong>,
							},
							{
								key: "expires",
								label: t("import.expires_at"),
								children: (
									<span className={"mono-num"}>
										{formatDateTime(data.expires_at)} ({t("import.expires_in", { time: countdown.label })})
									</span>
								),
							},
						]}
					/>
					<SummaryGrid summary={data.summary} />
					{data.summary.errors_count > 0 ? (
						<Alert
							type={"error"}
							showIcon={true}
							title={t("import.has_errors")}
						/>
					) : null}
					{moves > 0 ? (
						<Alert
							type={"warning"}
							showIcon={true}
							title={t("import.closes_warning", { count: moves })}
						/>
					) : null}
					<Flex
						gap={8}
						justify={"flex-end"}
						wrap={"wrap"}
					>
						<Button
							icon={<UploadOutlined />}
							onClick={newFile}
						>
							{t("import.new_file")}
						</Button>
						<Button
							type={"primary"}
							icon={<CheckCircleOutlined />}
							disabled={!data.can_confirm || countdown.expired}
							loading={confirm.isPending}
							onClick={() => confirm.mutate({ params: { path: { id } } })}
						>
							{t("import.confirm")}
						</Button>
					</Flex>
				</Flex>
			</Card>
			<ImportRowsTable rows={data.rows ?? []} />
		</>
	)
}
