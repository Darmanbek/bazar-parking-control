import { fileURLToPath, URL } from "node:url"
import { defineConfig } from "vite"
import { tanstackRouter } from "@tanstack/router-plugin/vite"
import react, { reactCompilerPreset } from "@vitejs/plugin-react"
import babel from "@rolldown/plugin-babel"

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
		react(),
		babel({ presets: [reactCompilerPreset()] }),
	],
})
