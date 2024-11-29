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
			external: ["three", "rxjs", "threads", "@dimforge/rapier3d-compat"],
			output: {
				globals: {
					three: "THREE",
					rxjs: "rxjs",
					threads: "threads",
					"@dimforge/rapier3d-compat": "RAPIER"
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
