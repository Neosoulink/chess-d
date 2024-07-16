const globals = require("globals");

/** @type {import("eslint").Linter.Config} */
module.exports = {
	extends: ["../node_modules/@quick-threejs/config/eslint.js"],
	globals: {
		...globals.browser
	}
};
