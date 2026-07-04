import { oxlintConfig } from "@adamhl8/configs"
import { defineConfig } from "oxlint"

const config = oxlintConfig({
  ignorePatterns: ["src/generated", "apps-script/on-submit.js"],
  // the Prisma model types are nullable, so we can't avoid null
  rules: { "unicorn/no-null": "off" },
  overrides: [
    {
      files: ["apps-script/on-submit.ts"],
      rules: {
        "import/unambiguous": "off",
        "func-style": "off",
        "no-implicit-globals": "off",
      },
    },
  ],
})

export default defineConfig(config)
