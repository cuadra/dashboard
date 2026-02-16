import { defineConfig } from "vite";
import { resolve } from "node:path";
import solid from "vite-plugin-solid";
import { macaronVitePlugin } from "@macaron-css/vite";

export default defineConfig({
  plugins: [macaronVitePlugin(), solid()],
  build: {
    outDir: "temp",
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        highlevel: resolve(__dirname, "highlevel.html"),
      },
    },
  },
});
