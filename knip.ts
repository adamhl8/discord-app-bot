import { knipConfig } from "@adamhl8/configs"

const config = knipConfig({
  project: ["!./src/generated/**/*", "!./apps-script/on-submit.js"],
  ignoreDependencies: ["@prisma/client", "@types/google-apps-script"],
})

export default config
