import { knipConfig } from "@adamhl8/configs"

const config = knipConfig({
  project: ["!./src/generated/**/*"],
  ignoreDependencies: ["@prisma/client"],
})

export default config
