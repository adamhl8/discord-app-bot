import { oxlintConfig } from "@adamhl8/configs"
import { defineConfig } from "oxlint"

const config = oxlintConfig({
  ignorePatterns: ["src/generated"],
  // the Prisma model types are nullable, so we can't avoid null
  rules: { "unicorn/no-null": "off" },
  overrides: [{ files: ["prisma.config.ts"], rules: { "import/no-default-export": "off" } }],
})

export default defineConfig(config)
