import { login } from 'discord-bot-shared'
import { ClientOptions, Intents } from 'discord.js'
import interactionCheck from './interactionCheck.js'

const botIntents: ClientOptions = {
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
  ],
  partials: ['REACTION'],
}

const bot = await login(botIntents, import.meta.url, interactionCheck)

export default bot
