// Router-level boundary components wired into createRouter (app/router.tsx).

import { ReloadOutlined } from "@ant-design/icons"
import type { ErrorComponentProps } from "@tanstack/react-router"
import { Button, Result, Spin } from "antd"
import { useTranslation } from "react-i18next"

export const Loader = () => (
	<div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 240 }}>
		<Spin size={"large"} />
	</div>
)

export const NotFound = () => {
	const { t } = useTranslation()
	return (
		<Result
			status={"404"}
			title={"404"}
			subTitle={t("state.not_found")}
		/>
	)
}

export const ErrorBoundary = ({ error, reset }: ErrorComponentProps) => {
	const { t } = useTranslation()
	return (
		<Result
			status={"error"}
			title={t("state.error")}
			subTitle={error instanceof Error ? error.message : String(error)}
			extra={
				reset ? (
					<Button
						type={"primary"}
						icon={<ReloadOutlined />}
						onClick={reset}
					>
						{t("state.retry")}
					</Button>
				) : undefined
			}
		/>
	)
}
