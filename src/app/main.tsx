import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { USE_MOCKS } from "src/shared/config"
import "src/app/i18n"
import { App } from "./app.tsx"
import "./styles/index.css"

// While the backend is not ready the API is answered by MSW. The worker must be
// up before the first request, so the app renders only after it starts; the
// mocks are a dynamic import, so a build with VITE_USE_MOCKS=false never loads them.
const enableMocks = async (): Promise<void> => {
	if (!USE_MOCKS) return
	const { worker } = await import("./mocks/browser.ts")
	await worker.start({ onUnhandledFrame: "bypass", quiet: true })
}

void enableMocks().then(() => {
	createRoot(document.getElementById("root")!).render(
		<StrictMode>
			<App />
		</StrictMode>
	)
})
