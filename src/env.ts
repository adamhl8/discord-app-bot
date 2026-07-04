import { parseEnv, requireWhen } from "@adamhl8/configs/env"
import { type } from "arkenv"

const BaseEnv = type({
  NODE_ENV: "('production' | 'development') = 'development'",
})
const baseEnv = parseEnv(BaseEnv)

const isProd = baseEnv.NODE_ENV === "production"

export const env = parseEnv(
  type({
    APPLICATION_ID: requireWhen(isProd, "string.digits > 0", ""),
    BOT_TOKEN: requireWhen(isProd, "string > 0", ""),
    DATABASE_URL: type("string").default(isProd ? "file:db/prod.db" : "file:./dev.db"),
    REGISTER_GUILD_COMMANDS: "boolean = false",
  }).merge(BaseEnv),
)
