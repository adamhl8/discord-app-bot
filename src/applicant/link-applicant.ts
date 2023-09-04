import { getChannel } from "discord-bot-shared"
import { ChannelType, ChatInputCommandInteraction, Guild, GuildMember } from "discord.js"
import { fetchMemberById } from "../util.js"
import { ApplicantWithSettings, saveApplicant } from "./applicant-db.js"
import { getCommonDetails, sendWarcraftlogsMessage } from "./applicant-service.js"

async function linkApplicant(interaction: ChatInputCommandInteraction<"cached">) {
  await interaction.deferReply()

  const { guild, applicantChannel, applicant } = await getCommonDetails(interaction)

  const user = interaction.options.getUser("applicant", true)
  const member = await fetchMemberById(guild, user.id)

  await linkMemberToApp(guild, member, applicant)
  await sendWarcraftlogsMessage(guild, applicant)

  await interaction.editReply(`${member.user.tag} has been linked to ${applicantChannel.name}.`)
}

async function linkMemberToApp(guild: Guild, member: GuildMember, applicant: ApplicantWithSettings) {
  await member.roles.add(applicant.guildSettings.applicantRoleId)

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
