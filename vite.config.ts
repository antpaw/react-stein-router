import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		react(),
		dts({
			rollupTypes: true,
		}),
	],
	build: {
		sourcemap: true,

		lib: {
			entry: "./src/lib.ts",
			name: "react-stein-router",
			fileName: (format) => `react-stein-router.${format}.js`,
		},
		rollupOptions: {
			external: ["react", "react-dom", "debug"],
			output: {
				globals: {
					react: "React",
					"react-dom": "ReactDOM",
					debug: "debug",
				},
			},
		},
	},
});
