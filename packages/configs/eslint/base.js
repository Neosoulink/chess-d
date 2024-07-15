const globals = require("globals");

/** @type {import("eslint").Linter.Config} */
module.exports = {
	ignorePatterns: ["*.config.cjs", "*.config.js", "*.config.ts"],
	globals: {
		...globals.browser
	},
	extends: [
		"eslint:recommended",
		"prettier",
		"eslint-config-turbo",
		"plugin:@typescript-eslint/recommended"
	],
	parser: "@typescript-eslint/parser",
	plugins: ["@typescript-eslint"],
	env: {
		node: true
	},
	settings: {},
	overrides: [
		{
			files: ["*.js?(x)", "*.ts?(x)"]
		}
	],
	rules: {
		quotes: ["error", "double"],
		semi: ["error", "always"],
		eqeqeq: "error",
		"@typescript-eslint/no-this-alias": "off",
		"@typescript-eslint/no-explicit-any": "off",
		"@typescript-eslint/ban-ts-comment": "off"
	},
	ignorePatterns: [
		"**/__tests__/*",
		".turbo/",
		"node_modules/",
		"dist/",
		"lib/",
		"coverage/",
		"*.d.ts",
		".*.js",
		"*.setup.js",
		"*.config.js",
		"*.config.cjs",
		"*.config.ts"
	]
};
