import type { Applicant } from "@prisma/client"
import type { ChatInputCommandInteraction, Guild, GuildMember } from "discord.js"
import { ChannelType } from "discord.js"
import { getChannel } from "discord-bot-shared"

import { saveApplicant } from "@/applicant/applicant-db.ts"
import { getCommonDetails, sendWarcraftlogsMessage } from "@/applicant/applicant-service.ts"
import { fetchMemberById } from "@/util.ts"

/**
 * @param interaction The interaction that triggered the command
 */
export async function linkApplicant(interaction: ChatInputCommandInteraction<"cached">) {
  await interaction.deferReply()

  const { guild, applicantChannel, applicant, settings } = await getCommonDetails(interaction)

  const user = interaction.options.getUser("applicant", true)
  const member = await fetchMemberById(guild, user.id)

  await linkMemberToApp(guild, settings.applicantRoleId, member, applicant)
  await sendWarcraftlogsMessage(guild, settings.postLogs, settings.postLogsChannelId, applicant)

  await interaction.editReply(`${member.user.tag} has been linked to ${applicantChannel.name}.`)
}

/**
 * @param guild The guild
 * @param applicantRoleId The ID of the applicant role
 * @param member The member to link to the applicant
 * @param applicant The applicant
 */
export async function linkMemberToApp(
  guild: Guild,
  applicantRoleId: string,
  member: GuildMember,
  applicant: Applicant,
) {
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
