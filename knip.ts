import { knipConfig } from "@adamhl8/configs"

const config = knipConfig({
  project: ["!./src/generated/**/*"],
  ignoreDependencies: ["@prisma/client"],
  prisma: {
    // By default, knip loads the `prisma.config.ts` file, which in turns tries to get the database URL: `env("DATABASE_URL")`.
    // This fails in CI where DATABASE_URL is not set. So instead we stop knip from loading the config and set the entries manually.
    config: [],
    entry: ["prisma.config.ts", "prisma/schema.prisma"],
  },
})

export default config
