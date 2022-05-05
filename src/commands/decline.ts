import { SlashCommandBuilder } from '@discordjs/builders'
import slugify from '@sindresorhus/slugify'
import { CommandInteraction } from 'discord.js'
import { getApplicant, saveApplicant } from '../applicant.js'
import { Command } from '../commands.js'
import { getSettings } from './settings.js'

const decline: Command = {
  command: new SlashCommandBuilder()
    .setName('decline')
    .setDescription('Decline an applicant.')
    .addChannelOption((option) =>
      option
        .setName('channel')
        .setDescription('Select the channel of the applicant you wish to decline.')
        .setRequired(true),
    )
    .addStringOption((option) =>
      option.setName('decline-message').setDescription('Leave blank to send the default decline message.'),
    ),
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

    const settings = getSettings()
    if (!settings) return

    const declineMessageString = interaction.options.getString('decline-message')
    const declineMessageText = declineMessageString ? declineMessageString : settings.declineMessage

    const declineMessage = await channel
      .send(
        `<@${applicant.memberId}>\n\n${declineMessageText}\n\nPlease click the 👍 reaction on this message to confirm that you have read this message. Upon confirmation your application will be closed and you will be removed from the server.`,
      )
      .catch(console.error)
    if (!declineMessage)
      return await interaction.reply(`Unable to send decline message for ${name}.`).catch(console.error)

    await declineMessage.react('👍').catch(console.error)

    applicant.declineMessageId = declineMessage.id
    saveApplicant(applicant)

    if (!interaction.guild) return await interaction.reply(`Unable to get guild.`).catch(console.error)
    const appsChannel = await interaction.guild.channels.fetch(settings.appsChannel.id).catch(console.error)
    if (!appsChannel || appsChannel.type !== 'GUILD_TEXT')
      return await interaction.reply(`Unable to get Apps Channel.`).catch(console.error)

    const declinedEmoji = interaction.guild.emojis.cache.find((emoji) => emoji.name === 'declined')
    if (!declinedEmoji) return await interaction.reply(`Unable to get declined emoji.`).catch(console.error)
    const appMessage = await appsChannel.messages.fetch(applicant.appMessageId).catch(console.error)
    if (!appMessage) return await interaction.reply(`Unable to get App Message.`).catch(console.error)
    await appMessage.react(declinedEmoji).catch(console.error)

    await interaction.reply(`${name} has been declined.\n${declineMessageText}`)
  },
}

export default decline
