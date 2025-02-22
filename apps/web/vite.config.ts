import autoprefixer from "autoprefixer";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
	css: {
		postcss: {
			plugins: [autoprefixer]
		}
	},
	plugins: [react(), tailwindcss()]
});
