import login from "discord-bot-shared"
import { ClientOptions, GatewayIntentBits as Intents, Partials } from "discord.js"
import commands from "./commands/_commands.js"
import events from "./events/_events.js"
import interactionCheck from "./interaction-check.js"

const botIntents: ClientOptions = {
  intents: [Intents.Guilds, Intents.GuildMembers, Intents.GuildMessages, Intents.GuildMessageReactions, Intents.MessageContent],
  partials: [Partials.Reaction],
}

const { GuildCollection } = await login(botIntents, commands, events, interactionCheck)

const getGuildCollection = () => GuildCollection

export { getGuildCollection }
