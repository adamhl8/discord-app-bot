import { SlashCommandBuilder } from '@discordjs/builders'
import { REST } from '@discordjs/rest'
import { Routes } from 'discord-api-types/v10'
import { Client, Intents } from 'discord.js'

const botToken = process.env.BOT_TOKEN || ''
const clientId = process.env.CLIENT_ID || ''
const guildId = process.env.GUILD_ID || ''

const botIntents = {
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_MESSAGE_REACTIONS],
}

const bot = new Client(botIntents)
void bot.login(botToken)

bot.once('ready', () => {
  console.log('I am ready!')
})

const commands = [
  new SlashCommandBuilder().setName('ping').setDescription('Replies with pong!'),
  new SlashCommandBuilder().setName('server').setDescription('Replies with server info!'),
  new SlashCommandBuilder().setName('user').setDescription('Replies with user info!'),
].map((command) => command.toJSON())

const rest = new REST().setToken(botToken)
try {
  await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
  console.log('Successfully reloaded application (/) commands.')
} catch (error) {
  console.error(error)
}

bot.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return

  const { commandName } = interaction

  switch (commandName) {
    case 'ping':
      await interaction.reply('Pong!')
      break
    case 'server':
      await interaction.reply('Server info.')
      break
    case 'user':
      await interaction.reply('User info.')
      break
  }
})
