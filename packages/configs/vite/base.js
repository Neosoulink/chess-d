const { defineConfig } = require("vite");
const config = require("@quick-threejs/config/vite");
const pkg = require("../package.json");

/** @type {import('vite').UserConfig} */
module.exports = defineConfig({
	...config,
	define: {
		...config.define,
		__APP_VERSION__: JSON.stringify(pkg.version)
	}
});
