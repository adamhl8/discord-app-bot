import { Command, isTextChannel, throwError } from "discord-bot-shared"
import { ChannelType, SlashCommandBuilder, TextChannel } from "discord.js"
import { getApplicant, removeApplicant } from "../applicant.js"
import { getGuildInfo } from "../util.js"

const accept: Command = {
  command: new SlashCommandBuilder()
    .setName("accept")
    .setDescription("Accept an applicant.")
    .addChannelOption((option) =>
      option.setName("channel").setDescription("Select the channel of the applicant you wish to accept.").setRequired(true),
    ) as SlashCommandBuilder,
  run: async (interaction) => {
    if (!interaction.guildId) throwError("Unable to get guild ID.")
    const { guild, settings } = await getGuildInfo(interaction.guildId)
    if (!settings) return

    await interaction.deferReply()

    const channel = interaction.options.getChannel("channel") || throwError("Unable to get channel.")
    if (!isTextChannel(channel)) throwError("Channel is not a text channel.")

    const applicant = (await getApplicant(channel.name, guild.id)) || throwError(`Unable to get applicant ${channel.name}.`)
    if (!applicant.memberId) throwError(`Applicant ${channel.name} is not in the server or hasn't been linked.`)

    const members = await guild.members
    const member = members.get(applicant.memberId) || throwError(`Unable to get member.`)

    await member.roles.remove(settings.applicantRole.id)
    await channel.delete()

    const appsChannel =
      (await guild.getChannel<TextChannel>(settings.appsChannel.id, ChannelType.GuildText)) || throwError(`Unable to get Apps channel.`)

    const emojis = await guild.emojis
    const approvedEmoji = emojis.find((emoji) => emoji.name === "approved") || throwError(`Unable to find approved emoji.`)
    const appMessage = (await appsChannel.messages.fetch(applicant.appMessageId)) || throwError(`Unable to get App message.`)
    await appMessage.react(approvedEmoji)

    await removeApplicant(applicant, guild.id)

    await interaction.editReply(`${channel.name} has been accepted.`)
  },
}

export default accept
