import { oxlintConfig } from "@adamhl8/configs"
import { defineConfig } from "oxlint"

const config = oxlintConfig({
  ignorePatterns: ["src/generated", "apps-script/on-submit.js"],
  overrides: [
    {
      // Disable `import/unambiguous` here because it reports at the start of the file, where no disable comment reaches.
      // Apps Script runs `on-submit.ts` as a classic script, so it can't have an import or export.
      files: ["apps-script/on-submit.ts"],
      rules: { "import/unambiguous": "off" },
    },
  ],
})

export default defineConfig(config)
