import type { ChatInputCommandInteraction } from "discord.js"
import { throwUserError } from "discord-bot-shared"

import { saveApplicant } from "~/applicant/applicant-db.ts"
import { getCommonDetails, reactToApplication } from "~/applicant/applicant-service.ts"

/**
 * @param interaction The interaction that triggered the command
 */
export async function declineApplicant(interaction: ChatInputCommandInteraction<"cached">) {
  await interaction.deferReply()

  const { guild, applicantChannel, applicant, settings } = await getCommonDetails(interaction)
  if (!applicant.memberId)
    throwUserError(`Applicant "${applicantChannel.name}" is not in the server or hasn't been linked.`)

  const declineMessageText = interaction.options.getString("decline-message") ?? settings.declineMessage
  // Only kick if not false. i.e. kick is true if option is true or null
  const kick = interaction.options.getBoolean("kick") !== false
  const kickText = kick ? " and you will be removed from the server." : "."
  const declineMessage = await applicantChannel.send(
    `<@${applicant.memberId}>\n\n${declineMessageText}\n\nPlease click the 👍 reaction on this message to confirm that you have read this message. Upon confirmation your application will be closed${kickText}`,
  )
  await declineMessage.react("👍")

  applicant.kick = kick
  applicant.declineMessageId = declineMessage.id
  await saveApplicant(applicant)

  await reactToApplication(guild, settings.appsChannelId, applicant, "declined")

  await interaction.editReply(`${applicantChannel.name} has been declined.\n${declineMessageText}`)
}
