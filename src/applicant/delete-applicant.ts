import type { ChatInputCommandInteraction } from "discord.js"

import { removeApplicant } from "./applicant-db.ts"
import { getCommonDetails, reactToApplication } from "./applicant-service.ts"

/**
 * @param interaction The interaction that triggered the command
 */
export async function deleteApplicant(interaction: ChatInputCommandInteraction<"cached">) {
  await interaction.deferReply()

  const { guild, applicantChannel, applicant, settings } = await getCommonDetails(interaction)

  await reactToApplication(guild, settings.appsChannelId, applicant, "declined")
  await applicantChannel.delete()
  await removeApplicant(applicant)

  const reason = interaction.options.getString("reason") ?? ""
  await interaction.editReply(`${applicantChannel.name} has been deleted.\n${reason}`)
}
