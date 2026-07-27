import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const repositoryName =
  process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "CJIS-Compliance-Navigator";

export default defineConfig({
  root: fileURLToPath(new URL("./github-pages", import.meta.url)),
  base: process.env.GITHUB_ACTIONS ? `/${repositoryName}/` : "/",
  plugins: [react()],
  publicDir: fileURLToPath(new URL("./public", import.meta.url)),
  build: {
    outDir: fileURLToPath(new URL("./pages-dist", import.meta.url)),
    emptyOutDir: true,
  },
});
