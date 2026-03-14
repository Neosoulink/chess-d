import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";
import tseslint from "@typescript-eslint/eslint-plugin";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
	baseDirectory: __dirname,
	recommendedConfig: js.configs.recommended,
	allConfig: js.configs.all
});

/** @type {import("eslint").Linter.Config} */
const configs = {
	files: ["./src/**/*.js?(x)", "./src/**/*.ts?(x)"],
	languageOptions: {
		parserOptions: {
			project: true
		}
	}
};

export default [
	{ plugins: { "@typescript-eslint": tseslint } },
	...compat.extends("./node_modules/@chess-d/configs/eslint/base.js"),
	configs
];
