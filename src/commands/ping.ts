import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction } from 'discord.js'
import { Command } from '../commands.js'

const ping: Command = {
  data: new SlashCommandBuilder().setName('ping').setDescription('Replies with Pong!'),
  run: async (interaction: CommandInteraction) => {
    await interaction.reply('Pong!')
  },
}

export default ping
