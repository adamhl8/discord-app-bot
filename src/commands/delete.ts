import { Command, getGuildCache, isTextChannel, throwError } from 'discord-bot-shared'
import { SlashCommandBuilder } from 'discord.js'
import { getApplicant, removeApplicant } from '../applicant.js'
import { getSettings } from './settings.js'

const deleteApplication: Command = {
  command: new SlashCommandBuilder()
    .setName('delete')
    .setDescription('Delete an application.')
    .addChannelOption((option) =>
      option
        .setName('channel')
        .setDescription('Select the channel of the application you wish to delete.')
        .setRequired(true),
    ) as SlashCommandBuilder,
  run: async (interaction) => {
    const channel = interaction.options.getChannel('channel') || throwError('Unable to get channel.')
    if (!isTextChannel(channel)) throwError('Channel is not a text channel.')

    const applicant = getApplicant(channel.name) || throwError(`Unable to get applicant ${channel.name}.`)
    const settings = getSettings() || throwError('Unable to get settings.')

    const { channels, emojis } = (await getGuildCache()) || throwError('Unable to get guild cache.')
    const appsChannel = channels.get(settings.appsChannel.id) || throwError('Unable to get Apps channel.')
    if (!isTextChannel(appsChannel)) throwError('Channel is not a text channel.')

    const declinedEmoji =
      emojis.find((emoji) => emoji.name === 'declined') || throwError(`Unable to get declined emoji.`)
    const appMessage =
      (await appsChannel.messages.fetch(applicant.appMessageId)) || throwError(`Unable to get App message.`)
    await appMessage.react(declinedEmoji)

    await channel.delete()
    removeApplicant(applicant)

    await interaction.reply(`${channel.name} has been deleted.`)
  },
}

export default deleteApplication
