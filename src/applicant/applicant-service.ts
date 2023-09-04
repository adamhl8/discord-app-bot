import { getChannel, throwError, throwUserError } from "discord-bot-shared"
import { ChannelType, ChatInputCommandInteraction } from "discord.js"
import { getSettings } from "../settings/settings-db.js"
import { sendWarcraftlogsMessage } from "../util.js"
import { getApplicant, removeApplicant, saveApplicant } from "./applicant-db.js"

async function acceptApplicant(interaction: ChatInputCommandInteraction<"cached">) {
  await interaction.deferReply()

  const guild = interaction.guild
  const settings = await getSettings(guild.id)

  const channel = interaction.options.getChannel("channel", true, [ChannelType.GuildText])

  const applicant = await getApplicant(channel.name, guild.id)
  if (!applicant.memberId) throwUserError(`Applicant "${channel.name}" is not in the server or hasn't been linked.`)

  const members = await guild.members.fetch()
  const member = members.get(applicant.memberId) ?? throwError(`Failed to get member with ID: ${applicant.memberId}`)

  await member.roles.remove(settings.applicantRoleId)
  await channel.delete()

  const appsChannel = await getChannel(guild, settings.appsChannelId, ChannelType.GuildText)

  const emojis = await guild.emojis.fetch()
  const approvedEmoji =
    emojis.find((emoji) => emoji.name === "approved") ?? throwUserError(`Failed to find emoji with name: approved`)
  const appMessage = await appsChannel.messages.fetch(applicant.appMessageId)
  await appMessage.react(approvedEmoji)

  await removeApplicant(applicant)

  await interaction.editReply(`\`${channel.name}\` has been accepted.`)
}

async function declineApplicant(interaction: ChatInputCommandInteraction<"cached">) {
  await interaction.deferReply()

  const guild = interaction.guild
  const settings = await getSettings(guild.id)

  const channel = interaction.options.getChannel("channel", true, [ChannelType.GuildText])

  const applicant = await getApplicant(channel.name, guild.id)
  if (!applicant.memberId) throwUserError(`Applicant "${channel.name}" is not in the server or hasn't been linked.`)

  const declineMessageText = interaction.options.getString("decline-message") ?? settings.declineMessage

  const kick = interaction.options.getBoolean("kick") !== false
  const kickText = kick ? " and you will be removed from the server." : "."
  const declineMessage = await channel.send(
    `<@${applicant.memberId}>\n\n${declineMessageText}\n\nPlease click the 👍 reaction on this message to confirm that you have read this message. Upon confirmation your application will be closed${kickText}`,
  )
  await declineMessage.react("👍")

  applicant.kick = kick
  applicant.declineMessageId = declineMessage.id
  await saveApplicant(applicant)

  const emojis = await guild.emojis.fetch()
  const appsChannel = await getChannel(guild, settings.appsChannelId, ChannelType.GuildText)

  const declinedEmoji =
    emojis.find((emoji) => emoji.name === "declined") ?? throwUserError(`Failed to find emoji with name: declined`)
  const appMessage = await appsChannel.messages.fetch(applicant.appMessageId)
  await appMessage.react(declinedEmoji)

  await interaction.editReply(`${channel.name} has been declined.\n${declineMessageText}`)
}

async function deleteApplicant(interaction: ChatInputCommandInteraction<"cached">) {
  await interaction.deferReply()

  const guild = interaction.guild
  const settings = await getSettings(guild.id)

  const channel = interaction.options.getChannel("channel", true, [ChannelType.GuildText])

  const applicant = await getApplicant(channel.name, guild.id)

  const appsChannel = await getChannel(guild, settings.appsChannelId, ChannelType.GuildText)

  const emojis = await guild.emojis.fetch()
  const declinedEmoji =
    emojis.find((emoji) => emoji.name === "declined") ?? throwUserError(`Failed to find emoji with name: declined`)
  const appMessage = await appsChannel.messages.fetch(applicant.appMessageId)
  await appMessage.react(declinedEmoji)

  const reason = interaction.options.getString("reason") ?? ""

  await channel.delete()
  await removeApplicant(applicant)

  await interaction.editReply(`${channel.name} has been deleted.\n${reason}`)
}

async function linkApplicant(interaction: ChatInputCommandInteraction<"cached">) {
  await interaction.deferReply()

  const guild = interaction.guild
  const settings = await getSettings(guild.id)

  const channel = interaction.options.getChannel("channel", true, [ChannelType.GuildText])

  const applicant = await getApplicant(channel.name, guild.id)
  const user = interaction.options.getUser("applicant", true)

  const members = await guild.members.fetch()
  const member = members.get(user.id) ?? throwError(`Failed to get member with ID: ${applicant.memberId}`)

  applicant.memberId = member.id
  await saveApplicant(applicant)

  await member.roles.add(settings.applicantRoleId)
  await channel.permissionOverwrites.create(member.user, { ViewChannel: true })
  await channel.send(appResponse(member.toString()))

  if (applicant.warcraftlogs) await sendWarcraftlogsMessage(guild, settings, member.toString(), applicant.warcraftlogs)

  await interaction.editReply(`${member.user.tag} has been linked to ${channel.name}.`)
}

function appResponse(memberMention: string) {
  return (
    `${memberMention}\n\n` +
    "Thank you for your application. Once a decision has been made, you will be messaged/pinged with a response."
  )
}

export { acceptApplicant, appResponse, declineApplicant, deleteApplicant, linkApplicant }
