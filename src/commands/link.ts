import { SlashCommandBuilder } from '@discordjs/builders'
import slugify from '@sindresorhus/slugify'
import { Command } from 'discord-bot-shared'
import { CommandInteraction } from 'discord.js'
import { appResponse, getApplicant, saveApplicant } from '../applicant.js'
import { getSettings } from './settings.js'

const link: Command = {
  command: new SlashCommandBuilder()
    .setName('link')
    .setDescription('Link an applicant.')
    .addChannelOption((option) =>
      option
        .setName('channel')
        .setDescription('Select the channel that the applicant will be linked to.')
        .setRequired(true),
    )
    .addUserOption((option) =>
      option
        .setName('applicant')
        .setDescription('The applicant to be linked to the selected channel.')
        .setRequired(true),
    ) as SlashCommandBuilder,
  run: async (interaction: CommandInteraction) => {
    const channel = interaction.options.getChannel('channel')
    if (!channel || channel.type !== 'GUILD_TEXT')
      return await interaction.reply('Unable to get channel.').catch(console.error)

    const name = slugify(channel.name)
    const applicant = getApplicant(name)
    if (!applicant) return await interaction.reply(`Unable to get applicant ${name}.`).catch(console.error)

    const user = interaction.options.getUser('applicant')
    if (!user) return await interaction.reply(`Unable to get user.`).catch(console.error)

    if (!interaction.guild) return await interaction.reply(`Unable to get guild.`).catch(console.error)
    const member = await interaction.guild.members.fetch(user.id).catch(console.error)
    if (!member) return await interaction.reply(`Unable to get member.`).catch(console.error)

    applicant.memberId = member.id
    applicant.tag = member.user.tag
    saveApplicant(applicant)

    const settings = getSettings()
    if (!settings) return

    await member.roles.add(settings.applicantRole.id).catch(console.error)

    await channel.permissionOverwrites.create(member.user, { VIEW_CHANNEL: true }).catch(console.error)

    await channel.send(appResponse(applicant.memberId)).catch(console.error)

    await interaction.reply(`${member.user.tag} has been linked to ${name}.`)
  },
}

export default link
