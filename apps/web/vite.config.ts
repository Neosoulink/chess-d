import autoprefixer from "autoprefixer";
import tailwindcss from "tailwindcss";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
	css: {
		postcss: {
			plugins: [tailwindcss, autoprefixer]
		}
	},
	plugins: [react()]
});
