import type { ChatInputCommandInteraction } from "discord.js"
import { throwUserError } from "discord-bot-shared"

import { removeApplicant } from "~/applicant/applicant-db.ts"
import { getCommonDetails, reactToApplication } from "~/applicant/applicant-service.ts"
import { fetchMemberById } from "~/util.ts"

/**
 * @param interaction The interaction that triggered the command.
 */
export async function acceptApplicant(interaction: ChatInputCommandInteraction<"cached">) {
  await interaction.deferReply()

  const { guild, applicantChannel, applicant, settings } = await getCommonDetails(interaction)

  const { applicantRoleId, appsChannelId } = settings
  if (!(applicantRoleId && appsChannelId))
    throwUserError("Missing required settings 'applicantRoleId', 'appsChannelId'. Run the /settings command.")

  if (!applicant.memberId)
    throwUserError(`Applicant "${applicantChannel.name}" is not in the server or hasn't been linked.`)

  const member = await fetchMemberById(guild, applicant.memberId)
  await member.roles.remove(applicantRoleId)

  await applicantChannel.delete()
  await reactToApplication(guild, appsChannelId, applicant, "approved")
  await removeApplicant(applicant)

  await interaction.editReply(`\`${applicantChannel.name}\` has been accepted.`)
}
