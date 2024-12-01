import autoprefixer from "autoprefixer";
import tailwindcss from "tailwindcss";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
	css: {
		postcss: {
			plugins: [tailwindcss, autoprefixer]
		}
	},
	plugins: [react()]
});
