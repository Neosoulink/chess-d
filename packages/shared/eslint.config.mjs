import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
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
		// Hoisted parser matches scope-manager; @quick-threejs/config's nested parser can mismatch and crash on enums.
		parser: tsParser,
		parserOptions: {
			project: true,
			tsconfigRootDir: __dirname
		}
	}
};

export default [
	{ plugins: { "@typescript-eslint": tseslint } },
	...compat.extends("./node_modules/@chess-d/configs/eslint/base.js"),
	configs
];
