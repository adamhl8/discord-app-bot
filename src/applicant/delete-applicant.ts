import type { ChatInputCommandInteraction } from "discord.js"
import { throwUserError } from "discord-bot-shared"

import { removeApplicant } from "~/applicant/applicant-db.ts"
import { getCommonDetails, reactToApplication } from "~/applicant/applicant-service.ts"

/**
 * @param interaction The interaction that triggered the command
 */
export async function deleteApplicant(interaction: ChatInputCommandInteraction<"cached">) {
  await interaction.deferReply()

  const { guild, applicantChannel, applicant, settings } = await getCommonDetails(interaction)

  const { appsChannelId } = settings
  if (!appsChannelId) throwUserError("Missing required setting 'applicantRoleId'. Run the /settings command.")

  await reactToApplication(guild, appsChannelId, applicant, "declined")
  await applicantChannel.delete()
  await removeApplicant(applicant)

  const reason = interaction.options.getString("reason") ?? ""
  await interaction.editReply(`${applicantChannel.name} has been deleted.\n${reason}`)
}
