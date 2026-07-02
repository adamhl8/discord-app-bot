import { oxfmtConfig } from "@adamhl8/configs"
import { defineConfig } from "oxfmt"

const config = oxfmtConfig({ ignorePatterns: ["src/generated"] })

export default defineConfig(config)
