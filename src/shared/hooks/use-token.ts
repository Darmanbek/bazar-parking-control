import { theme } from "antd"

export const useToken = () => {
	const { token } = theme.useToken()
	return { token }
}
