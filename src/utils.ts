import type { Bot } from "discord-bot-shared"
import type { GuildMember } from "discord.js"
import type { Result } from "ts-explicit-errors"
import { attempt, isErr } from "ts-explicit-errors"

import { prisma } from "#db.ts"
import { stopServer } from "#server/server.ts"
import { getSettings } from "#settings/settings-db.ts"

/** Whether the member is an admin or has one of the configured officer roles */
export const isModerator = async (member: GuildMember): Promise<Result<boolean>> => {
  const isAdmin = member.permissions.has("Administrator")
  const settings = await getSettings(member.guild)
  if (isErr(settings)) return settings

  if (!settings.officerRoleIds) return isAdmin
  const officerRoleIds = settings.officerRoleIds.split(",")

  return officerRoleIds.some((roleId) => member.roles.cache.has(roleId)) || isAdmin
}

export const registerShutdown = (bot: Bot) => {
  const shutdown = async (signal: NodeJS.Signals) => {
    console.log(`received ${signal}, shutting down`)
    const result = await attempt(async () => {
      await stopServer()
      await bot.logout()
      await prisma.$disconnect()
    })

    const shutdownError = isErr(result)
    if (shutdownError) console.error(`error during shutdown: ${result.messageChain}`)
    process.exitCode = shutdownError ? 1 : 0
  }
  process.on("SIGTERM", (signal) => void shutdown(signal))
  process.on("SIGINT", (signal) => void shutdown(signal))
}
