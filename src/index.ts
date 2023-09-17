import Bot from "discord-bot-shared"
import { ClientOptions, GatewayIntentBits as Intents, Partials } from "discord.js"
import addCommands from "./commands/_commands.js"
import commandHook from "./commands/command-hook.js"
import addEvents from "./events/_events.js"

const applicationId = process.env.APPLICATION_ID ?? ""
const token = process.env.BOT_TOKEN ?? ""

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

bot.commands.setGlobalCommandHook(commandHook)

addCommands(bot)
addEvents(bot)

await bot.commands.unregisterGuildCommands()
await bot.commands.unregisterApplicationCommands()
await bot.commands.register()
await bot.login()
