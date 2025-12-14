import { ChannelType, SlashCommandBuilder } from "discord.js"
import type { Command } from "discord-bot-shared"
import { components } from "discord-bot-shared"
import { isErr } from "ts-explicit-errors"

import { closeApplication, getApplicantChannelDetails } from "~/applicant/applicant-service.ts"

export const accept: Command = {
  command: new SlashCommandBuilder()
    .setName("accept")
    .setDescription("Accept an applicant.")
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("Select the channel of the applicant you wish to accept.")
        .setRequired(true),
    ),
  run: async (interaction) => {
    await interaction.deferReply()

    const applicantChannel = interaction.options.getChannel("channel", true, [ChannelType.GuildText])

    const commonDetails = await getApplicantChannelDetails(applicantChannel)
    if (isErr(commonDetails)) throw new Error(commonDetails.messageChain)
    const { applicant } = commonDetails

    if (!applicant.memberId) {
      interaction.editReply(
        components.warn(
          "Applicant has not joined the server or has not been linked (`/link`). To delete the channel, use the `/delete` command.",
        ),
      )
      return
    }

    const closeApplicationResult = await closeApplication(applicantChannel, "approved")
    if (isErr(closeApplicationResult)) throw new Error(closeApplicationResult.messageChain)

    await interaction.editReply(`\`${applicantChannel.name}\` has been accepted.`)
  },
}
