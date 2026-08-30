import { defineConfig } from "vite";

export default defineConfig({

    build: {

        outDir: "dist",

        emptyOutDir: true,

        rollupOptions: {

            input: {

                popup: "src/popup/popup.html",

                background: "src/background/background.js",

                content: "src/content/content.js"

            },

            output: {

                entryFileNames: "[name].js",

                chunkFileNames: "chunks/[name].js",

                assetFileNames: "assets/[name].[ext]"

            }

        }

    }

});