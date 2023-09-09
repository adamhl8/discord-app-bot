import { throwUserError } from "discord-bot-shared"
import { ChatInputCommandInteraction } from "discord.js"
import { fetchMemberById } from "../util.js"
import { removeApplicant } from "./applicant-db.js"
import { getCommonDetails, reactToApplication } from "./applicant-service.js"

async function acceptApplicant(interaction: ChatInputCommandInteraction<"cached">) {
  await interaction.deferReply()

  const { guild, applicantChannel, applicant, settings } = await getCommonDetails(interaction)
  if (!applicant.memberId)
    throwUserError(`Applicant "${applicantChannel.name}" is not in the server or hasn't been linked.`)

  const member = await fetchMemberById(guild, applicant.memberId)
  await member.roles.remove(settings.applicantRoleId)

  await applicantChannel.delete()
  await reactToApplication(guild, applicant, "approved")
  await removeApplicant(applicant)

  await interaction.editReply(`\`${applicantChannel.name}\` has been accepted.`)
}

export default acceptApplicant
