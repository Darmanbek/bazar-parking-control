import { readFileSync } from "node:fs"
import { createRequire } from "node:module"
import { fileURLToPath, URL } from "node:url"
import { defineConfig, type Plugin } from "vite"
import { tanstackRouter } from "@tanstack/router-plugin/vite"
import react, { reactCompilerPreset } from "@vitejs/plugin-react"
import babel from "@rolldown/plugin-babel"

const require = createRequire(import.meta.url)

/**
 * Serves MSW's service worker in `vite dev` only. It is deliberately not in
 * public/, so a production build ships no mock machinery at all (TZ §6.2).
 */
const mswWorkerDevOnly = (): Plugin => ({
	name: "msw-worker-dev-only",
	apply: "serve",
	configureServer(server) {
		const worker = require.resolve("msw/mockServiceWorker.js")
		server.middlewares.use("/mockServiceWorker.js", (_req, res) => {
			res.setHeader("Content-Type", "application/javascript")
			res.end(readFileSync(worker))
		})
	},
})

// https://vite.dev/config/
export default defineConfig({
	resolve: {
		alias: {
			src: fileURLToPath(new URL("./src", import.meta.url)),
		},
	},
	plugins: [
		tanstackRouter({
			target: "react",
			autoCodeSplitting: true,
			quoteStyle: "double",
			semicolons: false,
			routesDirectory: "./src/pages",
			generatedRouteTree: "./src/page-tree.gen.ts",
		}),
		mswWorkerDevOnly(),
		react(),
		babel({ presets: [reactCompilerPreset()] }),
	],
})
