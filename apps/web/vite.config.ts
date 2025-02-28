import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import autoprefixer from "autoprefixer";
import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
	css: {
		postcss: {
			plugins: [autoprefixer]
		}
	},
	plugins: [react(), tailwindcss()],
	base: "./",
	worker: {
		format: "es"
	},
	build: {
		rollupOptions: {
			input: {
				"game-worker": "src/core/game/game.worker.ts",
				"ai-worker": "src/core/ai/ai.worker.ts",
				index: "index.html"
			},
			output: {
				entryFileNames: "[name].js"
			}
		}
	},

	resolve: {
		alias: {
			"@/": resolve(__dirname, "src/")
		}
	}
});
