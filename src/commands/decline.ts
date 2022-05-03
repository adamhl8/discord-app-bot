import { SlashCommandBuilder } from '@discordjs/builders'
import slugify from '@sindresorhus/slugify'
import { CommandInteraction } from 'discord.js'
import { getApplicant, saveApplicant } from '../applicant.js'
import { Command } from '../commands.js'
import storage from '../storage.js'
import { checkSettings, Settings } from './settings.js'

const decline: Command = {
  data: new SlashCommandBuilder()
    .setName('decline')
    .setDescription('Decline an applicant.')
    .addStringOption((option) =>
      option
        .setName('applicant')
        .setDescription('Enter the channel name of the applicant you wish to decline.')
        .setRequired(true),
    )
    .addStringOption((option) =>
      option.setName('decline-message').setDescription('Leave blank to send the default decline message.'),
    ) as SlashCommandBuilder,
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
    const channel = await interaction.guild.channels.fetch(applicant.channelId)
    if (!channel || channel.type !== 'GUILD_TEXT')
      return await interaction.reply(`Channel does not exist for applicant: ${name}`)

    const declineMessageString = interaction.options.getString('decline-message')
    const declineMessageText = declineMessageString ? declineMessageString : settings.declineMessage

    const declineMessage = await channel
      .send(
        `<@${applicant.memberId}>\n\n${declineMessageText}\n\nPlease click the 👍 reaction on this message to confirm that you have read this message. Upon confirmation your application will be closed and you will be removed from the server.`,
      )
      .catch(console.error)
    if (!declineMessage) return await interaction.reply(`Unable to send decline message for: ${name}`)

    await declineMessage.react('👍').catch(console.error)

    applicant.declineMessageId = declineMessage.id
    saveApplicant(applicant)

    const appsChannel = await interaction.guild.channels.fetch(settings.appsChannel.id)
    if (!appsChannel || appsChannel.type !== 'GUILD_TEXT') return await interaction.reply(`Could not get Apps Channel.`)

    const declinedEmoji = interaction.guild.emojis.cache.find((emoji) => emoji.name === 'declined')
    if (!declinedEmoji) return await interaction.reply(`Unable to find declined emoji.`)
    const appMessage = await appsChannel.messages.fetch(applicant.appMessageId).catch(console.error)
    if (!appMessage) return await interaction.reply(`Unable to get App Message.`)
    await appMessage.react(declinedEmoji).catch(console.error)

    await interaction.reply(`${name} has been declined.`)
  },
}

export default decline
