import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction } from 'discord.js'
import { Command } from '../commands.js'
import storage from '../storage.js'

const ping: Command = {
  data: new SlashCommandBuilder().setName('ping').setDescription('Replies with Pong!'),
  run: async (interaction: CommandInteraction) => {
    await interaction.reply('Pong!')
    storage.push('/test', 'wow!')
  },
}

export default ping
