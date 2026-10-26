import { knipConfig } from "@adamhl8/configs"

const config = knipConfig({
  // Exclude `on-submit.js` because tsdown builds it from `on-submit.ts`.
  project: ["!./apps-script/on-submit.js"],
  // Ignore issues in the generated Prisma client instead of excluding it, so knip still follows its `@prisma/client` imports.
  ignore: ["src/generated/**"],
  // List the apps-script tsconfig because its `types` are the only use of `@types/google-apps-script`.
  typescript: { config: ["tsconfig.json", "apps-script/tsconfig.json"] },
})

export default config
