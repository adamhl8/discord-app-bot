import login from "discord-bot-shared"
import { ClientOptions, GatewayIntentBits as Intents, Partials } from "discord.js"
import interactionCheck from "./interaction-check.js"

const botIntents: ClientOptions = {
  intents: [Intents.Guilds, Intents.GuildMembers, Intents.GuildMessages, Intents.GuildMessageReactions, Intents.MessageContent],
  partials: [Partials.Reaction],
}

const bot = await login(botIntents, import.meta.url, interactionCheck)

export default bot
