import type { Command } from "discord-bot-shared"
import { components } from "discord-bot-shared"
import { ChannelType, ChatInputCommandBuilder } from "discord.js"
import { err, isErr } from "ts-explicit-errors"

import { closeApplication, getApplicantChannelDetails } from "#applicant/applicant-service.ts"

export const accept: Command = {
  command: new ChatInputCommandBuilder()
    .setName("accept")
    .setDescription("Accept an applicant.")
    .addChannelOptions((option) =>
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
      void interaction.editReply(
        components.warn(
          "Applicant has not joined the server or has not been linked (`/link`). To delete the channel, use the `/delete` command.",
        ),
      )
      return
    }

    const closeApplicationResult = await closeApplication(applicantChannel, "approved")
    if (isErr(closeApplicationResult))
      throw new Error(err("failed to close application", closeApplicationResult).messageChain)

    await interaction.editReply(`\`${applicantChannel.name}\` has been accepted.`)
  },
}
