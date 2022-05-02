import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction } from 'discord.js'
import { Command } from '../commands.js'
import storage from '../storage.js'

const init: Command = {
  data: new SlashCommandBuilder()
    .setName('init')
    .setDescription('First-time set up.')
    .addRoleOption((option) =>
      option
        .setName('officer-role')
        .setDescription('Members must have this role to interact with app-bot.')
        .setRequired(true),
    )
    .addRoleOption((option) =>
      option.setName('applicant-role').setDescription('The role given to each applicant.').setRequired(true),
    ) as SlashCommandBuilder, // This shouldn't be here.
  run: async (interaction: CommandInteraction) => {
    await interaction.reply('Pong!')
    storage.push('/test', 'wow!')
  },
}

export default init
