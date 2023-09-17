import { Applicant } from "@prisma/client"
import { getChannel } from "discord-bot-shared"
import { ChannelType, ChatInputCommandInteraction, Guild, GuildMember } from "discord.js"
import { fetchMemberById } from "../util.js"
import { saveApplicant } from "./applicant-db.js"
import { getCommonDetails, sendWarcraftlogsMessage } from "./applicant-service.js"

async function linkApplicant(interaction: ChatInputCommandInteraction<"cached">) {
  await interaction.deferReply()

  const { guild, applicantChannel, applicant, settings } = await getCommonDetails(interaction)

  const user = interaction.options.getUser("applicant", true)
  const member = await fetchMemberById(guild, user.id)

  await linkMemberToApp(guild, settings.applicantRoleId, member, applicant)
  await sendWarcraftlogsMessage(guild, settings.postLogs, settings.postLogsChannelId, applicant)

  await interaction.editReply(`${member.user.tag} has been linked to ${applicantChannel.name}.`)
}

async function linkMemberToApp(guild: Guild, applicantRoleId: string, member: GuildMember, applicant: Applicant) {
  await member.roles.add(applicantRoleId)

  applicant.memberId = member.id
  await saveApplicant(applicant)

  const applicantChannel = await getChannel(guild, applicant.channelId, ChannelType.GuildText)
  await applicantChannel.permissionOverwrites.create(member.user, { ViewChannel: true })
  await applicantChannel.send(
    `${member.toString()}\n\n` +
      "Thank you for your application. Once a decision has been made, you will be messaged/pinged with a response.",
  )
}

export default linkApplicant
export { linkMemberToApp }
