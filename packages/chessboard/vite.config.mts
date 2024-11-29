import { resolve } from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
	build: {
		lib: {
			entry: resolve(__dirname, "./src/main.ts"),
			name: "ChessDShared",
			fileName: "main"
		},
		rollupOptions: {
			external: [
				"@chess-d/rapier-physics",
				"@chess-d/shared",
				"@quick-threejs/reactive",
				"@quick-threejs/utils",
				"chess.js",
				"rxjs",
				"threads",
				"three",
				"typescript-ioc",
				"tsyringe"
			],
			output: {
				globals: {
					"@chess-d/rapier-physics": "ChessDRapierPhysics",
					"@chess-d/shared": "ChessDShared",
					"@quick-threejs/reactive": "QuickThreeReactive",
					"@quick-threejs/utils": "QuickThreeUtils",
					"chess.js": "Chess",
					rxjs: "rxjs",
					threads: "threads",
					three: "THREE",
					"typescript-ioc": "ioc",
					tsyringe: "tsyringe"
				}
			}
		}
	},
	resolve: {
		alias: {
			"@/": resolve(__dirname, "src/")
		}
	},
	plugins: [dts()]
});
