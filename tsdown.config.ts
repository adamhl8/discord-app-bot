import { tsdownConfig } from "@adamhl8/configs"
import { defineConfig } from "tsdown"

const config = {
  ...tsdownConfig({
    outDir: "./apps-script/",
    clean: false,
    platform: "neutral",
    attw: false,
    publint: false,
    dts: false,
    sourcemap: false,
    unbundle: false,
    minify: false,
    treeshake: false,
    inputOptions: {
      experimental: {
        attachDebugInfo: "none", // remove region comments in output
      },
    },
  }),
  entry: ["./apps-script/on-submit.ts"],
}

export default defineConfig(config)
