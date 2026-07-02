import { knipConfig } from "@adamhl8/configs"

const config = knipConfig({
  project: ["!./src/generated/**/*"],
  ignoreDependencies: ["@prisma/client"],
} as const)

export default config
