// The one place the app's toast surface is chosen. Every call site — the $api
// wrapper included — sees only `message`, so switching between antd's
// `notification` and `message` is a one-line change here.

import useApp from "antd/es/app/useApp"

export const useMessage = () => {
	const { notification } = useApp()

	return { message: notification }
}
