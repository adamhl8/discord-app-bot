import { Client, ClientOptions, Intents } from 'discord.js'
import { registerCommands } from './commands.js'
import registerEvents from './events.js'

const botToken = process.env.BOT_TOKEN || ''
const clientId = process.env.CLIENT_ID || ''
const guildId = process.env.GUILD_ID || ''

const botIntents: ClientOptions = {
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
  ],
  partials: ['REACTION'],
}

const bot = new Client(botIntents)
void registerCommands()
void registerEvents()
void bot.login(botToken)

export default bot
export { botToken, clientId, guildId }
