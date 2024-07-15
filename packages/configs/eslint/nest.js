const globals = require("globals");

/** @type {import("eslint").Linter.Config} */
module.exports = {
	extends: ["./base.js"],
	globals: {
		...globals.node
	},
	rules: {
		"@typescript-eslint/interface-name-prefix": "off",
		"@typescript-eslint/explicit-function-return-type": "off",
		"@typescript-eslint/explicit-module-boundary-types": "off"
	},
	env: {
		node: true,
		jest: true
	}
};
