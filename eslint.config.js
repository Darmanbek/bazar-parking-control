import js from "@eslint/js"
import globals from "globals"
import react from "eslint-plugin-react"
import reactHooks from "eslint-plugin-react-hooks"
import reactRefresh from "eslint-plugin-react-refresh"
import tseslint from "typescript-eslint"
import { defineConfig, globalIgnores } from "eslint/config"

// Layer order: app → pages → features → widgets → shared, imports DOWN only.
// NOTE widgets sits BELOW features in this architecture, so `features → widgets`
// is the intended direction and is deliberately absent from the map below.
const upperLayers = {
	shared: ["app", "pages", "features", "widgets"],
	widgets: ["app", "pages", "features"],
	features: ["app", "pages"],
	pages: ["app"],
}

// Both spellings of a cross-layer import have to be caught. `group` is minimatch,
// and minimatch's `*`/`**` deliberately refuse to match a `..` segment, so the
// glob below can only ever see the absolute `src/<layer>/...` form. The relative
// form — `../../widgets/x`, which resolves to exactly the same module — needs the
// `regex` pattern: one or more `../` hops followed by the layer name.
const layerRules = Object.entries(upperLayers).map(([layer, forbidden]) => ({
	files: [`src/${layer}/**/*.{ts,tsx}`],
	rules: {
		"no-restricted-imports": [
			"error",
			{
				patterns: forbidden.flatMap((upper) => {
					const message = `Layer violation: src/${layer} must not import from src/${upper}.`
					return [
						{ group: [`src/${upper}`, `src/${upper}/*`], message },
						{ regex: `^(\\.\\./)+${upper}(/|$)`, message },
					]
				}),
			},
		],
	},
}))

export default defineConfig([
	globalIgnores(["dist", "public/mockServiceWorker.js", "src/page-tree.gen.ts", "src/shared/api/schema.d.ts"]),
	{
		files: ["**/*.{ts,tsx}"],
		extends: [
			js.configs.recommended,
			tseslint.configs.recommended,
			reactHooks.configs.flat.recommended,
			reactRefresh.configs.vite,
		],
		languageOptions: {
			globals: globals.browser,
		},
		plugins: {
			react,
		},
		rules: {
			...reactHooks.configs.recommended.rules,
			"react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
			"react/jsx-curly-brace-presence": ["error", { props: "always", children: "ignore" }],
			"no-tabs": 0,
			"no-console": "warn",
			"@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
			"react/jsx-key": ["error"],
			"react/jsx-boolean-value": ["error", "always"],
			semi: ["error", "never"],
			quotes: ["error", "double", { allowTemplateLiterals: true }],
			"@typescript-eslint/consistent-type-imports": "error",
		},
	},
	...layerRules,
])
