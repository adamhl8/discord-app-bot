import { ESLintConfigBuilder } from "eslint-config-builder"
import tseslint from "typescript-eslint"

const eslintConfig = new ESLintConfigBuilder().jsonYamlToml().build()

export default tseslint.config({ ignores: ["dist/**"] }, eslintConfig, {
  files: ["src/events/app-create.ts"],
  rules: {
    "unicorn/no-null": "off",
  },
})
