import { SlashCommandBuilder } from '@discordjs/builders'
import slugify from '@sindresorhus/slugify'
import { CommandInteraction } from 'discord.js'
import { getApplicant, removeApplicant } from '../applicant.js'
import { Command } from '../commands.js'
import storage from '../storage.js'
import { checkSettings, Settings } from './settings.js'

const accept: Command = {
  command: new SlashCommandBuilder()
    .setName('accept')
    .setDescription('Accept an applicant.')
    .addStringOption((option) =>
      option
        .setName('applicant')
        .setDescription('Enter the channel name of the applicant you wish to accept.')
        .setRequired(true),
    ),
  run: async (interaction: CommandInteraction) => {
    if (!(await checkSettings(interaction))) return
    const settings = storage.getObject<Settings>('/settings')

    const applicantName = interaction.options.getString('applicant')
    if (!applicantName) return await interaction.reply('Unable to get applicant option.')

    const name = slugify(applicantName)
    const applicant = getApplicant(name)
    if (!applicant) return await interaction.reply(`Applicant does not exist: ${name}`)

    if (!applicant.memberId)
      return await interaction.reply(`Applicant is not in the server or hasn't been linked: ${name}`)

    if (!interaction.guild) return await interaction.reply(`Unable to get guild.`)
    const member = await interaction.guild.members.fetch(applicant.memberId).catch(console.error)
    if (!member) return await interaction.reply(`Unable to get member.`)

    await member.roles.remove(settings.applicantRole.id).catch(console.error)

    const channel = await interaction.guild.channels.fetch(applicant.channelId)
    if (!channel || channel.type !== 'GUILD_TEXT')
      return await interaction.reply(`Channel does not exist for applicant: ${name}`)

    await channel.delete().catch(console.error)

    const appsChannel = await interaction.guild.channels.fetch(settings.appsChannel.id).catch(console.error)
    if (!appsChannel || appsChannel.type !== 'GUILD_TEXT') return await interaction.reply(`Could not get Apps Channel.`)

    const approvedEmoji = interaction.guild.emojis.cache.find((emoji) => emoji.name === 'approved')
    if (!approvedEmoji) return await interaction.reply(`Unable to find approved emoji.`)
    const appMessage = await appsChannel.messages.fetch(applicant.appMessageId).catch(console.error)
    if (!appMessage) return await interaction.reply(`Unable to get App Message.`)
    await appMessage.react(approvedEmoji).catch(console.error)

    removeApplicant(applicant)

    await interaction.reply(`${name} has been accepted.`)
  },
}

export default accept
