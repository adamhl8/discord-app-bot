import { Bot } from "discord-bot-shared"
import type { ClientOptions } from "discord.js"
import { Events, GatewayIntentBits as Intents } from "discord.js"

import { addCommands } from "#commands/_commands.ts"
import { commandHook } from "#commands/command-hook.ts"
import { env } from "#env.ts"
import { addEvents } from "#events/_events.ts"
import packageJson from "#package.json" with { type: "json" }
import { startServer } from "#server/server.ts"
import { registerShutdown } from "#utils.ts"

console.log(`discord-app-bot v${packageJson.version}`)

const applicationId = env.APPLICATION_ID
const token = env.BOT_TOKEN

const clientOptions: ClientOptions = {
  intents: [Intents.Guilds, Intents.GuildMembers],
}

const bot = new Bot({ applicationId, token, clientOptions })
registerShutdown(bot)

bot.commands.setGlobalCommandHook(commandHook)
addCommands(bot)
addEvents(bot)

bot.events.add({
  event: Events.ClientReady,
  once: true,
  handler: (_, readyClient) => {
    startServer(readyClient)
  },
})

if (env.NODE_ENV === "production") await bot.commands.register()
else if (env.REGISTER_GUILD_COMMANDS) await bot.commands.guildRegister()

await bot.login()
