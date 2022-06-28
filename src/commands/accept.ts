import { SlashCommandBuilder } from '@discordjs/builders'
import slugify from '@sindresorhus/slugify'
import { Command } from 'discord-bot-shared'
import { CommandInteraction } from 'discord.js'
import { getApplicant, removeApplicant } from '../applicant.js'
import { getSettings } from './settings.js'

const accept: Command = {
  command: new SlashCommandBuilder()
    .setName('accept')
    .setDescription('Accept an applicant.')
    .addChannelOption((option) =>
      option
        .setName('channel')
        .setDescription('Select the channel of the applicant you wish to accept.')
        .setRequired(true),
    ) as SlashCommandBuilder,
  run: async (interaction: CommandInteraction) => {
    const channel = interaction.options.getChannel('channel')
    if (!channel || channel.type !== 'GUILD_TEXT')
      return await interaction.reply('Unable to get channel.').catch(console.error)

    const name = slugify(channel.name)
    const applicant = getApplicant(name)
    if (!applicant) return await interaction.reply(`Unable to get applicant ${name}.`).catch(console.error)

    if (!applicant.memberId)
      return await interaction
        .reply(`Applicant ${name} is not in the server or hasn't been linked.`)
        .catch(console.error)

    if (!interaction.guild) return await interaction.reply(`Unable to get guild.`).catch(console.error)
    const member = await interaction.guild.members.fetch(applicant.memberId).catch(console.error)
    if (!member) return await interaction.reply(`Unable to get member.`).catch(console.error)

    const settings = getSettings()
    if (!settings) return

    await member.roles.remove(settings.applicantRole.id).catch(console.error)

    await channel.delete().catch(console.error)

    const appsChannel = await interaction.guild.channels.fetch(settings.appsChannel.id).catch(console.error)
    if (!appsChannel || appsChannel.type !== 'GUILD_TEXT')
      return await interaction.reply(`Could not get Apps Channel.`).catch(console.error)

    const approvedEmoji = interaction.guild.emojis.cache.find((emoji) => emoji.name === 'approved')
    if (!approvedEmoji) return await interaction.reply(`Unable to find approved emoji.`).catch(console.error)
    const appMessage = await appsChannel.messages.fetch(applicant.appMessageId).catch(console.error)
    if (!appMessage) return await interaction.reply(`Unable to get App Message.`).catch(console.error)
    await appMessage.react(approvedEmoji).catch(console.error)

    removeApplicant(applicant)

    await interaction.reply(`${name} has been accepted.`)
  },
}

export default accept
