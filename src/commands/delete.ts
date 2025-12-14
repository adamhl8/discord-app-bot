import { ChannelType, SlashCommandBuilder } from "discord.js"
import type { Command } from "discord-bot-shared"
import { isErr } from "ts-explicit-errors"

import { closeApplication, getApplicantChannelDetails } from "~/applicant/applicant-service.ts"

export const deleteApplication: Command = {
  command: new SlashCommandBuilder()
    .setName("delete")
    .setDescription("Delete an application.")
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("Select the channel of the application you wish to delete.")
        .setRequired(true),
    )
    .addStringOption((option) => option.setName("reason").setDescription("Provide a reason for deletion.")),
  run: async (interaction) => {
    await interaction.deferReply()

    const applicantChannel = interaction.options.getChannel("channel", true, [ChannelType.GuildText])

    const commonDetails = await getApplicantChannelDetails(applicantChannel)
    if (isErr(commonDetails)) throw new Error(commonDetails.messageChain)
    const { applicant } = commonDetails

    const isApplicantInServer = Boolean(applicant.memberId)

    const closeApplicationResult = await closeApplication(applicantChannel, "declined", isApplicantInServer)
    if (isErr(closeApplicationResult)) throw new Error(closeApplicationResult.messageChain)

    const reason = interaction.options.getString("reason") ?? ""
    await interaction.editReply(`\`${applicantChannel.name}\` has been deleted.\n${reason}`)
  },
}
