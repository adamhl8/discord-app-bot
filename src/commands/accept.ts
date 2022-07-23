import slugify from '@sindresorhus/slugify'
import { Command, getGuildCache, isTextChannel, throwError } from 'discord-bot-shared'
import { SlashCommandBuilder } from 'discord.js'
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
  run: async (interaction) => {
    const channel = interaction.options.getChannel('channel') || throwError('Unable to get channel.')
    if (!isTextChannel(channel)) throwError('Channel is not a text channel.')

    const name = slugify(channel.name)
    const applicant = getApplicant(name) || throwError(`Unable to get applicant ${name}.`)
    if (!applicant.memberId) throwError(`Applicant ${name} is not in the server or hasn't been linked.`)

    const { members, channels, emojis } = (await getGuildCache()) || throwError('Unable to get guild cache.')
    const member = members.get(applicant.memberId) || throwError(`Unable to get member.`)

    const settings = getSettings() || throwError('Unable to get settings.')

    await member.roles.remove(settings.applicantRole.id)
    await channel.delete()

    const appsChannel = channels.get(settings.appsChannel.id) || throwError(`Unable to get Apps channel.`)
    if (!isTextChannel(appsChannel)) throwError('Channel is not a text channel.')

    const approvedEmoji =
      emojis.find((emoji) => emoji.name === 'approved') || throwError(`Unable to find approved emoji.`)
    const appMessage =
      (await appsChannel.messages.fetch(applicant.appMessageId)) || throwError(`Unable to get App message.`)
    await appMessage.react(approvedEmoji)

    removeApplicant(applicant)

    await interaction.reply(`${name} has been accepted.`)
  },
}

export default accept
