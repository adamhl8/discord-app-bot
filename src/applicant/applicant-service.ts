import { NonNullChatInputCommandInteraction, getChannel, isTextChannel, throwError } from "discord-bot-shared"
import { ChannelType, ChatInputCommandInteraction, TextChannel } from "discord.js"
import { getSettings } from "../settings/settings-db.js"
import { getApplicant, removeApplicant, saveApplicant } from "./applicant-db.js"

async function acceptApplicant(interaction: NonNullChatInputCommandInteraction) {
  const guild = interaction.guild
  const settings = await getSettings(guild.id)

  await interaction.deferReply()

  const channel = interaction.options.getChannel("channel") ?? throwError("Unable to get channel.")
  if (!isTextChannel(channel)) throwError("Channel is not a text channel.")

  const applicant = await getApplicant(channel.name, guild.id)
  if (!applicant.memberId) throwError(`Applicant ${channel.name} is not in the server or hasn't been linked.`)

  const members = await guild.members.fetch()
  const member = members.get(applicant.memberId) ?? throwError(`Unable to get member.`)

  await member.roles.remove(settings.applicantRoleId)
  await channel.delete()

  const appsChannel = await getChannel<TextChannel>(guild, settings.appsChannelId, ChannelType.GuildText)

  const emojis = await guild.emojis.fetch()
  const approvedEmoji =
    emojis.find((emoji) => emoji.name === "approved") ?? throwError(`Unable to find approved emoji.`)
  const appMessage = await appsChannel.messages.fetch(applicant.appMessageId)
  await appMessage.react(approvedEmoji)

  await removeApplicant(applicant, guild.id)

  await interaction.editReply(`${channel.name} has been accepted.`)
}

async function declineApplicant(context: CommandContext, interaction: ChatInputCommandInteraction) {
  const guild = context.guild
  const settings = await getSettings(guild.id)

  await interaction.deferReply()

  const channel = interaction.options.getChannel("channel") ?? throwError("Unable to get channel.")
  if (!isTextChannel(channel)) throwError("Channel is not a text channel.")

  const applicant = await getApplicant(channel.name, guild.id)
  if (!applicant.memberId) throwError(`Applicant ${channel.name} is not in the server or hasn't been linked.`)

  const declineMessageText = interaction.options.getString("decline-message") ?? settings.declineMessage

  const kick = interaction.options.getBoolean("kick") !== false
  const kickText = kick ? " and you will be removed from the server." : "."
  const declineMessage = await channel.send(
    `<@${applicant.memberId}>\n\n${declineMessageText}\n\nPlease click the 👍 reaction on this message to confirm that you have read this message. Upon confirmation your application will be closed${kickText}`,
  )
  await declineMessage.react("👍")

  applicant.kick = kick
  applicant.declineMessageId = declineMessage.id
  await saveApplicant(applicant, guild.id)

  const emojis = await guild.emojis.fetch()
  const appsChannel = await getChannel<TextChannel>(guild, settings.appsChannel.id, ChannelType.GuildText)

  const declinedEmoji = emojis.find((emoji) => emoji.name === "declined") ?? throwError(`Unable to get declined emoji.`)
  const appMessage = await appsChannel.messages.fetch(applicant.appMessageId)
  await appMessage.react(declinedEmoji)

  await interaction.editReply(`${channel.name} has been declined.\n${declineMessageText}`)
}

async function deleteApplicant(context: CommandContext, interaction: ChatInputCommandInteraction) {
  const guild = context.guild
  const settings = await getSettings(guild.id)

  await interaction.deferReply()

  const channel = interaction.options.getChannel("channel") ?? throwError("Unable to get channel.")
  if (!isTextChannel(channel)) throwError("Channel is not a text channel.")

  const applicant = await getApplicant(channel.name, guild.id)

  const appsChannel = await getChannel<TextChannel>(guild, settings.appsChannel.id, ChannelType.GuildText)

  const emojis = await guild.emojis.fetch()
  const declinedEmoji = emojis.find((emoji) => emoji.name === "declined") ?? throwError(`Unable to get declined emoji.`)
  const appMessage = await appsChannel.messages.fetch(applicant.appMessageId)
  await appMessage.react(declinedEmoji)

  const reason = interaction.options.getString("reason") ?? ""

  await channel.delete()
  await removeApplicant(applicant, guild.id)

  await interaction.editReply(`${channel.name} has been deleted.\n${reason}`)
}

async function linkApplicant(context: CommandContext, interaction: ChatInputCommandInteraction) {
  const guild = context.guild
  const settings = await getSettings(guild.id)

  await interaction.deferReply()

  const channel = interaction.options.getChannel("channel") ?? throwError("Unable to get channel.")
  if (!isTextChannel(channel)) throwError("Channel is not a text channel.")

  const applicant = await getApplicant(channel.name, guild.id)
  const user = interaction.options.getUser("applicant") ?? throwError(`Unable to get user.`)

  const members = await guild.members.fetch()
  const member = members.get(user.id) ?? throwError(`Unable to get member.`)

  applicant.memberId = member.id
  await saveApplicant(applicant, guild.id)

  await member.roles.add(settings.applicantRole.id)
  await channel.permissionOverwrites.create(member.user, { ViewChannel: true })
  await channel.send(appResponse(member.toString()))

  if (applicant.warcraftlogs)
    await sendWarcraftlogsMessage({ guild, settings }, member.toString(), applicant.warcraftlogs)

  await interaction.editReply(`${member.user.tag} has been linked to ${channel.name}.`)
}

export { acceptApplicant, declineApplicant, deleteApplicant, linkApplicant }
