import fs from "fs/promises";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    nodePolyfills({
      // Whether to polyfill specific globals.
      globals: {
        Buffer: false, // can also be 'build', 'dev', or false
        global: false,
        process: true,
      },
      include: ["fs", "path", "crypto", "stream", "util", "http", "https"],
      // Whether to polyfill `node:` protocol imports.
      protocolImports: true,
    }),
    react(),
  ],
  mode: "development",
  optimizeDeps: {
    esbuildOptions: {
      plugins: [
        {
          name: "load-js-files-as-jsx",
          setup(build) {
            build.onLoad({ filter: /\/.*\.js$/ }, async (args) => ({
              loader: "jsx",
              contents: await fs.readFile(args.path, "utf8"),
            }));
          },
        },
      ],
    },
  },
  resolve: {
    alias: [
      {
        find: "./runtimeConfig",
        replacement: "./runtimeConfig.browser",
      },
      // Reference: https://github.com/vercel/turbo/discussions/620#discussioncomment-2136195
      {
        find: "@ui",
        replacement: path.resolve(__dirname, "../../packages/ui/src"),
      },
      {
        find: "@permaupload",
        replacement: path.resolve(__dirname, "../../packages/permaupload/src"),
      },
    ],
  },
});
