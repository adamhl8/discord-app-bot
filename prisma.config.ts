import { defineConfig, env } from "prisma/config"

// biome-ignore lint/style/noDefaultExport: ignore
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
})
