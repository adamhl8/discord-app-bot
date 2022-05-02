import { Client, Intents } from 'discord.js'
import { registerCommands } from './commands.js'
import registerEvents from './events.js'

const botToken = process.env.BOT_TOKEN || ''
const clientId = process.env.CLIENT_ID || ''
const guildId = process.env.GUILD_ID || ''

const botIntents = {
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_MESSAGE_REACTIONS],
}

const bot = new Client(botIntents)
void registerEvents()
void registerCommands(botToken, clientId, guildId)
void bot.login(botToken)

export default bot
