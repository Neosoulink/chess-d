// vite.config.mts
import { resolve } from "path";
import { defineConfig } from "file:///Users/neosoulink/Documents/dev/projects/MonorepoApp/chess-d/node_modules/.pnpm/vite@5.4.11_@types+node@22.10.1_terser@5.36.0/node_modules/vite/dist/node/index.js";
import dts from "file:///Users/neosoulink/Documents/dev/projects/MonorepoApp/chess-d/node_modules/.pnpm/vite-plugin-dts@4.3.0_@types+node@22.10.1_rollup@4.27.4_typescript@5.7.2_vite@5.4.11_@types+node@22.10.1_terser@5.36.0_/node_modules/vite-plugin-dts/dist/index.mjs";
var __vite_injected_original_dirname = "/Users/neosoulink/Documents/dev/projects/MonorepoApp/chess-d/packages/ai";
var vite_config_default = defineConfig({
  build: {
    lib: {
      entry: resolve(__vite_injected_original_dirname, "./src/main.ts"),
      name: "ChessDShared",
      fileName: "main"
    },
    rollupOptions: {
      external: ["three", "rxjs", "threads", "@dimforge/rapier3d-compat"],
      output: {
        globals: {
          three: "THREE",
          rxjs: "Rxjs",
          threads: "Threads",
          "@dimforge/rapier3d-compat": "RAPIER"
        }
      }
    }
  },
  resolve: {
    alias: {
      "@/": resolve(__vite_injected_original_dirname, "src/")
    }
  },
  plugins: [dts()]
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcubXRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL25lb3NvdWxpbmsvRG9jdW1lbnRzL2Rldi9wcm9qZWN0cy9Nb25vcmVwb0FwcC9jaGVzcy1kL3BhY2thZ2VzL2FpXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvbmVvc291bGluay9Eb2N1bWVudHMvZGV2L3Byb2plY3RzL01vbm9yZXBvQXBwL2NoZXNzLWQvcGFja2FnZXMvYWkvdml0ZS5jb25maWcubXRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy9uZW9zb3VsaW5rL0RvY3VtZW50cy9kZXYvcHJvamVjdHMvTW9ub3JlcG9BcHAvY2hlc3MtZC9wYWNrYWdlcy9haS92aXRlLmNvbmZpZy5tdHNcIjtpbXBvcnQgeyByZXNvbHZlIH0gZnJvbSBcInBhdGhcIjtcbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gXCJ2aXRlXCI7XG5pbXBvcnQgZHRzIGZyb20gXCJ2aXRlLXBsdWdpbi1kdHNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcblx0YnVpbGQ6IHtcblx0XHRsaWI6IHtcblx0XHRcdGVudHJ5OiByZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyYy9tYWluLnRzXCIpLFxuXHRcdFx0bmFtZTogXCJDaGVzc0RTaGFyZWRcIixcblx0XHRcdGZpbGVOYW1lOiBcIm1haW5cIlxuXHRcdH0sXG5cdFx0cm9sbHVwT3B0aW9uczoge1xuXHRcdFx0ZXh0ZXJuYWw6IFtcInRocmVlXCIsIFwicnhqc1wiLCBcInRocmVhZHNcIiwgXCJAZGltZm9yZ2UvcmFwaWVyM2QtY29tcGF0XCJdLFxuXHRcdFx0b3V0cHV0OiB7XG5cdFx0XHRcdGdsb2JhbHM6IHtcblx0XHRcdFx0XHR0aHJlZTogXCJUSFJFRVwiLFxuXHRcdFx0XHRcdHJ4anM6IFwiUnhqc1wiLFxuXHRcdFx0XHRcdHRocmVhZHM6IFwiVGhyZWFkc1wiLFxuXHRcdFx0XHRcdFwiQGRpbWZvcmdlL3JhcGllcjNkLWNvbXBhdFwiOiBcIlJBUElFUlwiXG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cdHJlc29sdmU6IHtcblx0XHRhbGlhczoge1xuXHRcdFx0XCJAL1wiOiByZXNvbHZlKF9fZGlybmFtZSwgXCJzcmMvXCIpXG5cdFx0fVxuXHR9LFxuXHRwbHVnaW5zOiBbZHRzKCldXG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBNFksU0FBUyxlQUFlO0FBQ3BhLFNBQVMsb0JBQW9CO0FBQzdCLE9BQU8sU0FBUztBQUZoQixJQUFNLG1DQUFtQztBQUl6QyxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMzQixPQUFPO0FBQUEsSUFDTixLQUFLO0FBQUEsTUFDSixPQUFPLFFBQVEsa0NBQVcsZUFBZTtBQUFBLE1BQ3pDLE1BQU07QUFBQSxNQUNOLFVBQVU7QUFBQSxJQUNYO0FBQUEsSUFDQSxlQUFlO0FBQUEsTUFDZCxVQUFVLENBQUMsU0FBUyxRQUFRLFdBQVcsMkJBQTJCO0FBQUEsTUFDbEUsUUFBUTtBQUFBLFFBQ1AsU0FBUztBQUFBLFVBQ1IsT0FBTztBQUFBLFVBQ1AsTUFBTTtBQUFBLFVBQ04sU0FBUztBQUFBLFVBQ1QsNkJBQTZCO0FBQUEsUUFDOUI7QUFBQSxNQUNEO0FBQUEsSUFDRDtBQUFBLEVBQ0Q7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNSLE9BQU87QUFBQSxNQUNOLE1BQU0sUUFBUSxrQ0FBVyxNQUFNO0FBQUEsSUFDaEM7QUFBQSxFQUNEO0FBQUEsRUFDQSxTQUFTLENBQUMsSUFBSSxDQUFDO0FBQ2hCLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
