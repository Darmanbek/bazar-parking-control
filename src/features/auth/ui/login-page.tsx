// Sign-in. Split layout on desktop: the asphalt "lot" panel on the left, the
// form on the right; the panel drops away on smaller screens.

import { LockOutlined, UserOutlined } from "@ant-design/icons"
import { useNavigate } from "@tanstack/react-router"
import { Alert, Button, Flex, Form, Input, Typography } from "antd"
import type { FC } from "react"
import { useTranslation } from "react-i18next"
import { $api, type Schemas } from "src/shared/api"
import { USE_MOCKS } from "src/shared/config"
import { useMessage, useResponsive, useToken } from "src/shared/hooks"
import { Brandmark, PlateNumber } from "src/shared/ui"
import { tokenStorage } from "src/shared/utils"

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
					<Flex
						gap={10}
						wrap={"wrap"}
						style={{ marginBottom: 28 }}
					>
						<PlateNumber
							number={"95A777AA"}
							size={"large"}
						/>
						<PlateNumber
							number={"95123ABC"}
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
	const { token } = useToken()
	const { message } = useMessage()
	const { isDesktop } = useResponsive()
	const [form] = Form.useForm<LoginForm>()

	// Silent: a wrong password is answered inline under the title, not as a toast.
	const login = $api.useMutation("post", "/api/v1/auth/login", {
		meta: { silent: true },
		onSuccess: (data) => {
			tokenStorage.set(data.access_token)
			message.success({ title: t("auth.welcome") })
			void navigate({ to: "/" })
		},
	})

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

					{login.isError ? (
						<Alert
							type={"error"}
							showIcon={true}
							title={t("auth.wrong_credentials")}
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
							name={"username"}
							label={t("auth.username")}
							rules={[{ required: true, message: t("auth.username_required") }]}
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

					{USE_MOCKS ? (
						<Text
							type={"secondary"}
							style={{ display: "block", marginTop: 20, fontSize: 13, textAlign: "center" }}
						>
							{t("auth.demo_hint")}
						</Text>
					) : null}
				</div>
			</Flex>
		</Flex>
	)
}
