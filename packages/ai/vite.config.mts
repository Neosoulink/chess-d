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
			external: ["chess.js", "threads"],
			output: {
				globals: {
					"chess.js": "Chess",
					threads: "threads"
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
