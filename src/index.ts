import { Bot } from "discord-bot-shared"
import type { ClientOptions } from "discord.js"
import { GatewayIntentBits as Intents, Partials } from "discord.js"
import { attempt, isErr } from "ts-explicit-errors"

import { addCommands } from "#/commands/_commands.ts"
import { commandHook } from "#/commands/command-hook.ts"
import { prisma } from "#/db.ts"
import { env } from "#/env.ts"
import { addEvents } from "#/events/_events.ts"

const applicationId = env.APPLICATION_ID
const token = env.BOT_TOKEN

const clientOptions: ClientOptions = {
  intents: [
    Intents.Guilds,
    Intents.GuildMembers,
    Intents.GuildMessages,
    Intents.GuildMessageReactions,
    Intents.MessageContent,
  ],
  partials: [Partials.Reaction],
}

const bot = new Bot({ applicationId, token, clientOptions })

const shutdown = async (signal: NodeJS.Signals) => {
  console.log(`received ${signal}, shutting down`)
  const result = await attempt(async () => {
    await bot.logout()
    await prisma.$disconnect()
  })

  const shutdownError = isErr(result)
  if (shutdownError) console.error(`error during shutdown: ${result.messageChain}`)
  process.exitCode = shutdownError ? 1 : 0
}
process.on("SIGTERM", (signal) => void shutdown(signal))
process.on("SIGINT", (signal) => void shutdown(signal))

bot.commands.setGlobalCommandHook(commandHook)

addCommands(bot)
addEvents(bot)

if (env.NODE_ENV === "production") await bot.commands.register()
else if (env.REGISTER_GUILD_COMMANDS) await bot.commands.guildRegister()

await bot.login()
