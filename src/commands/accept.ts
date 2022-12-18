import { Command, getChannel, isTextChannel, throwError } from "discord-bot-shared"
import { ChannelType, SlashCommandBuilder, TextChannel } from "discord.js"
import { getApplicant, removeApplicant } from "../applicant.js"
import { getSettings } from "./settings.js"

const accept: Command = {
  command: new SlashCommandBuilder()
    .setName("accept")
    .setDescription("Accept an applicant.")
    .addChannelOption((option) =>
      option.setName("channel").setDescription("Select the channel of the applicant you wish to accept.").setRequired(true),
    )
    .toJSON(),
  run: async (context, interaction) => {
    const guild = context.guild
    const settings = await getSettings(guild.id)
    if (!settings) return

    await interaction.deferReply()

    const channel = interaction.options.getChannel("channel") || throwError("Unable to get channel.")
    if (!isTextChannel(channel)) throwError("Channel is not a text channel.")

    const applicant = (await getApplicant(channel.name, guild.id)) || throwError(`Unable to get applicant ${channel.name}.`)
    if (!applicant.memberId) throwError(`Applicant ${channel.name} is not in the server or hasn't been linked.`)

    const members = await guild.members.fetch()
    const member = members.get(applicant.memberId) || throwError(`Unable to get member.`)

    await member.roles.remove(settings.applicantRole.id)
    await channel.delete()

    const appsChannel = await getChannel<TextChannel>(guild, settings.appsChannel.id, ChannelType.GuildText)
    if (!appsChannel) throwError(`Unable to get Apps channel.`)

    const emojis = await guild.emojis.fetch()
    const approvedEmoji = emojis.find((emoji) => emoji.name === "approved") || throwError(`Unable to find approved emoji.`)
    const appMessage = (await appsChannel.messages.fetch(applicant.appMessageId)) || throwError(`Unable to get App message.`)
    await appMessage.react(approvedEmoji)

    await removeApplicant(applicant, guild.id)

    await interaction.editReply(`${channel.name} has been accepted.`)
  },
}

export default accept
