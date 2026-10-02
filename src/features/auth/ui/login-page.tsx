// Sign-in (§4.1, §7.1): `login` + password, then GET me. Split layout on
// desktop — the asphalt panel on the left, the form on the right.
//
// What the screen may say is fixed by the contract: a wrong login, an unknown
// account and a foreign role all answer the same 422, so one message covers
// them; the account's state (`account_expired` / `account_revoked`) arrives only
// after a correct password; `too_many_attempts` is a temporary lock. The reason
// a previous session ended (a 401 elsewhere) is shown once on arrival.

import { LockOutlined, UserOutlined } from "@ant-design/icons"
import { useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { Alert, Button, Flex, Form, Input, Typography } from "antd"
import type { FC } from "react"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { $api, type Schemas } from "src/shared/api"
import { useResponsive, useToken } from "src/shared/hooks"
import { errorCode, errorCodeText, fieldErrors, getErrorMessage } from "src/shared/lib"
import { Brandmark, PlateNumber } from "src/shared/ui"
import { logoutReason, tokenStorage } from "src/shared/utils"

const { Title, Text } = Typography

type LoginForm = Schemas["LoginRequest"]

const BrandPanel: FC = () => {
	const { t } = useTranslation()
	const points = t("auth.brand_points")

	return (
		<div style={{ position: "relative", flex: 1.1, overflow: "hidden", display: "flex" }}>
			<div className={"lot-panel"} />
			<Flex
				vertical={true}
				justify={"space-between"}
				style={{ position: "relative", zIndex: 1, width: "100%", padding: "44px 52px", color: "#fff" }}
			>
				<Flex
					align={"center"}
					gap={12}
				>
					<Brandmark size={44} />
					<div>
						<div style={{ fontWeight: 800, fontSize: 20 }}>{t("app.title")}</div>
						<div style={{ color: "#f2b544", fontSize: 13 }}>{t("app.subtitle")}</div>
					</div>
				</Flex>

				<div>
					{/* Sample plates in the contract's own placeholder form — never real ones (TZ §5). */}
					<Flex
						gap={10}
						wrap={"wrap"}
						style={{ marginBottom: 28 }}
					>
						<PlateNumber
							number={"00A000AA"}
							size={"large"}
						/>
						<PlateNumber
							number={"00B222BB"}
							size={"large"}
						/>
					</Flex>
					<h1 style={{ fontSize: 38, lineHeight: 1.12, fontWeight: 800, margin: 0, maxWidth: 500 }}>
						{t("auth.brand_title")}
					</h1>
					<Flex
						vertical={true}
						gap={12}
						style={{ marginTop: 24 }}
					>
						{points.map((point, i) => (
							<Flex
								key={point}
								align={"center"}
								gap={12}
							>
								<span
									className={"mono-num"}
									style={{
										width: 26,
										height: 26,
										borderRadius: 7,
										background: "rgba(242,181,68,0.16)",
										color: "#f2b544",
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										fontSize: 13,
										fontWeight: 700,
										flexShrink: 0,
									}}
								>
									{i + 1}
								</span>
								<span style={{ color: "rgba(255,255,255,0.86)", fontSize: 15 }}>{point}</span>
							</Flex>
						))}
					</Flex>
				</div>

				<div style={{ color: "rgba(255,255,255,0.45)", fontSize: 12 }}>© {new Date().getFullYear()}</div>
			</Flex>
		</div>
	)
}

export const LoginPage: FC = () => {
	const { t } = useTranslation()
	const navigate = useNavigate()
	const queryClient = useQueryClient()
	const { token } = useToken()
	const { isDesktop } = useResponsive()
	const [form] = Form.useForm<LoginForm>()
	// Why the previous session ended, if it was ended by the server.
	const [previousReason] = useState(() => logoutReason.take())

	// Silent: every login error is answered inline, not as a toast.
	const login = $api.useMutation("post", "/auth/login", {
		meta: { silent: true },
		onSuccess: (response) => {
			const { token: accessToken, expires_at } = response.data
			tokenStorage.set(accessToken, expires_at)
			// A new identity: nothing of a previous session's cache may survive.
			queryClient.clear()
			void navigate({ to: "/" })
		},
		onError: (error) => {
			// 422: one message for every "no such login / wrong password / wrong role".
			const fields = fieldErrors(error)
			if (fields.length) form.setFields(fields.map((f) => ({ ...f, name: f.name as keyof LoginForm })))
		},
	})

	const code = errorCode(login.error)
	const loginAlert = login.isError
		? code
			? (errorCodeText(code) ?? getErrorMessage(login.error, t("errors.server")))
			: fieldErrors(login.error).length
				? undefined
				: getErrorMessage(login.error, t("errors.server"))
		: previousReason
			? errorCodeText(previousReason)
			: undefined

	return (
		<Flex style={{ minHeight: "100vh", background: token.colorBgLayout }}>
			{isDesktop ? <BrandPanel /> : null}
			<Flex
				flex={1}
				justify={"center"}
				align={"center"}
				style={{ padding: 24 }}
			>
				<div style={{ width: "100%", maxWidth: 400 }}>
					{isDesktop ? null : (
						<Flex
							justify={"center"}
							style={{ marginBottom: 20 }}
						>
							<Brandmark size={52} />
						</Flex>
					)}
					<Title
						level={2}
						style={{ marginBottom: 4 }}
					>
						{t("auth.title")}
					</Title>
					<Text type={"secondary"}>{t("auth.subtitle")}</Text>

					{loginAlert ? (
						<Alert
							type={login.isError ? "error" : "warning"}
							showIcon={true}
							title={loginAlert}
							style={{ marginTop: 20 }}
						/>
					) : null}

					<Form<LoginForm>
						form={form}
						layout={"vertical"}
						requiredMark={false}
						size={"large"}
						style={{ marginTop: 24 }}
						onFinish={(body) => login.mutate({ body })}
					>
						<Form.Item<LoginForm>
							name={"login"}
							label={t("auth.login")}
							rules={[{ required: true, message: t("auth.login_required") }]}
						>
							<Input
								prefix={<UserOutlined />}
								autoComplete={"username"}
								autoFocus={true}
							/>
						</Form.Item>
						<Form.Item<LoginForm>
							name={"password"}
							label={t("auth.password")}
							rules={[{ required: true, message: t("auth.password_required") }]}
						>
							<Input.Password
								prefix={<LockOutlined />}
								autoComplete={"current-password"}
							/>
						</Form.Item>
						<Button
							type={"primary"}
							htmlType={"submit"}
							block={true}
							loading={login.isPending}
							style={{ marginTop: 8 }}
						>
							{t("auth.submit")}
						</Button>
					</Form>
				</div>
			</Flex>
		</Flex>
	)
}
