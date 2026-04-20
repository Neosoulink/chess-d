import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import autoprefixer from "autoprefixer";
import { resolve } from "path";
import { defineConfig, type Plugin } from "vite";

/** Crawlers (Facebook, X, Slack, etc.) require absolute URLs for og:image / twitter:image. */
function resolveSiteOrigin(command: string): string {
	const explicit = process.env.PUBLIC_SITE_ORIGIN?.trim().replace(/\/$/, "");
	if (explicit) return explicit;

	const vercel = process.env.VERCEL_URL?.trim();
	if (vercel) {
		const host = vercel.replace(/^https?:\/\//, "").replace(/\/$/, "");
		return `https://${host}`;
	}

	const netlify = process.env.DEPLOY_PRIME_URL ?? process.env.URL;
	if (netlify?.trim()) return netlify.trim().replace(/\/$/, "");

	const cfPages = process.env.CF_PAGES_URL?.trim();
	if (cfPages) return cfPages.replace(/\/$/, "");

	if (command === "serve") {
		const port = process.env.PORT ?? "5173";
		return `http://127.0.0.1:${port}`;
	}

	console.warn(
		"[apps/web] Production build: set PUBLIC_SITE_ORIGIN so social preview meta uses absolute image URLs."
	);
	return "";
}

function siteOriginHtmlPlugin(origin: string): Plugin {
	return {
		name: "site-origin-html",
		transformIndexHtml(html) {
			return html.replaceAll("__SITE_ORIGIN__", origin);
		}
	};
}

export default defineConfig(({ command }) => {
	const siteOrigin = resolveSiteOrigin(command);

	return {
		css: {
			postcss: {
				plugins: [autoprefixer]
			}
		},
		plugins: [react(), tailwindcss(), siteOriginHtmlPlugin(siteOrigin)],
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
				"@": resolve(__dirname, "src/")
			}
		},
		envPrefix: "PUBLIC_"
	};
});
