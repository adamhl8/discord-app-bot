import type { GuildMember, TextChannel } from "discord.js"
import { ContainerBuilder, MessageFlags, SeparatorSpacingSize } from "discord.js"
import getUrls from "get-urls"
import type { Result } from "ts-explicit-errors"
import { attempt, err, isErr } from "ts-explicit-errors"

import { getApplicant, removeApplicant, saveApplicant } from "~/applicant/applicant-db.ts"
import type { Applicant } from "~/generated/prisma/client.ts"
import { getGuildEmoji, getGuildTextChannel } from "~/guild-utils.ts"
import type { ResolvedGuildSettings } from "~/settings/settings-db.ts"
import { getResolvedSettings } from "~/settings/settings-db.ts"

interface CommonDetails {
  settings: ResolvedGuildSettings
  applicant: Applicant
}

export async function getApplicantChannelDetails({ guild, name }: TextChannel): Promise<Result<CommonDetails>> {
  const settings = await getResolvedSettings(guild)
  if (isErr(settings)) return settings

  const applicant = await getApplicant(name, guild)
  if (isErr(applicant)) return applicant

  return { settings, applicant }
}

export async function closeApplication(
  applicantChannel: TextChannel,
  emoji: string,
  removeApplicantRole = true,
): Promise<Result> {
  const applicantChannelDetails = await getApplicantChannelDetails(applicantChannel)
  if (isErr(applicantChannelDetails)) return applicantChannelDetails
  const { settings, applicant } = applicantChannelDetails

  const { guild, name } = applicantChannel
  const { appsChannel, applicantRole } = settings
  const { memberId, appMessageId } = applicant

  const appMessage = await attempt(() => appsChannel.messages.fetch(appMessageId))
  if (isErr(appMessage)) return err("failed to fetch application message", appMessage)

  const guildEmoji = await getGuildEmoji(guild, emoji)
  if (isErr(guildEmoji)) return guildEmoji

  // do the things

  if (removeApplicantRole) {
    if (!memberId) return err(`memberId is null for applicant \`${name}\``, undefined)

    const member = await attempt(() => guild.members.fetch({ user: memberId }))
    if (isErr(member)) return err("failed to fetch member", member)

    const removeRoleResult = await attempt(() => member.roles.remove(applicantRole))
    if (isErr(removeRoleResult)) return err("failed to remove applicant role", removeRoleResult)
  }

  const reactResult = await attempt(() => appMessage.react(guildEmoji))
  if (isErr(reactResult)) return err("failed to react to application", reactResult)

  const deleteApplicantChannelResult = await attempt(() => applicantChannel.delete())
  if (isErr(deleteApplicantChannelResult))
    return err("failed to delete applicant channel", deleteApplicantChannelResult)

  const removeApplicantResult = await removeApplicant(applicant)
  if (isErr(removeApplicantResult)) return removeApplicantResult
}

export async function linkMemberToApp(member: GuildMember, applicantChannel: TextChannel): Promise<Result> {
  const applicantChannelDetails = await getApplicantChannelDetails(applicantChannel)
  if (isErr(applicantChannelDetails)) return applicantChannelDetails
  const { settings, applicant } = applicantChannelDetails

  const { applicantRole } = settings

  await member.roles.add(applicantRole)

  applicant.memberId = member.id
  await saveApplicant(applicant)

  await applicantChannel.permissionOverwrites.create(member.user, { ViewChannel: true })
  await applicantChannel.send(
    `${member.toString()}\n\n` +
      "Thank you for your application. Once a decision has been made, you will be messaged/pinged with a response.",
  )
}

export async function sendWarcraftlogsMessage(applicantChannel: TextChannel): Promise<Result> {
  const applicantChannelDetails = await getApplicantChannelDetails(applicantChannel)
  if (isErr(applicantChannelDetails)) return applicantChannelDetails
  const { settings, applicant } = applicantChannelDetails

  const { guild } = applicantChannel
  const { postLogs, postLogsChannelId } = settings
  const { warcraftlogs, memberId } = applicant

  if (!(postLogs && postLogsChannelId && warcraftlogs)) return

  const warcraftlogsUrls = getUrls(warcraftlogs)
  let warcraftlogsText = "\n\n"
  for (const url of warcraftlogsUrls) {
    warcraftlogsText += `${url}\n`
  }

  const postLogsChannel = await getGuildTextChannel(guild, postLogsChannelId)
  if (isErr(postLogsChannel)) return err("failed to get post logs channel", postLogsChannel)

  const sendResult = await postLogsChannel.send({
    components: [
      new ContainerBuilder()
        .addTextDisplayComponents((t) => t.setContent(`**New Applicant: <@${memberId ?? "UNKNOWN"}>**`))
        .addSeparatorComponents((s) => s.setSpacing(SeparatorSpacingSize.Small))
        .addTextDisplayComponents((t) => t.setContent(warcraftlogsText)),
    ],
    flags: [MessageFlags.IsComponentsV2],
  })
  if (isErr(sendResult)) return err("failed to send Warcraft Logs message", sendResult)
}
