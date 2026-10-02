import "@fontsource-variable/onest"
import "@fontsource/jetbrains-mono/500.css"
import "@fontsource/jetbrains-mono/700.css"
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { USE_MOCKS } from "src/shared/config"
import "src/app/dayjs.ts"
import "src/app/i18n"
import { App } from "./app.tsx"
import "./styles/index.css"

// Fonts are bundled, not loaded from Google Fonts: no request leaves for a third
// party with the inspector's IP (H6).
//
// Local development without a backend can answer the API from MSW. The
// `import.meta.env.DEV` test must stay literally HERE: Vite replaces it with
// `false` in a production build, so the bundler drops this branch and the mocks
// it imports (TZ §6.2). Behind an imported constant alone it would not.
const enableMocks = async (): Promise<void> => {
	if (!import.meta.env.DEV || !USE_MOCKS) return
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
