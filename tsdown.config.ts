import { tsdownBundleConfig } from "@adamhl8/configs"
import { defineConfig } from "tsdown"

const config = tsdownBundleConfig({
  entry: "./apps-script/on-submit.ts",
  outDir: "./apps-script/",
  clean: false,
  platform: "neutral",
  minify: false,
  treeshake: false,
})

export default defineConfig(config)
