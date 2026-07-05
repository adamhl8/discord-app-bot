import type { Command } from "discord-bot-shared"
import { components } from "discord-bot-shared"
import { ActionRowBuilder, ChannelType, ChatInputCommandBuilder, PrimaryButtonBuilder } from "discord.js"
import { isErr } from "ts-explicit-errors"

import { saveApplicant } from "#/applicant/applicant-db.ts"
import { getApplicantChannelDetails } from "#/applicant/applicant-service.ts"

export const decline: Command = {
  command: new ChatInputCommandBuilder()
    .setName("decline")
    .setDescription("Decline an applicant.")
    .addChannelOptions((option) =>
      option
        .setName("channel")
        .setDescription("Select the channel of the applicant you wish to decline.")
        .setRequired(true),
    )
    .addStringOptions((option) =>
      option.setName("decline-message").setDescription("Leave blank to send the default decline message."),
    )
    .addBooleanOptions((option) =>
      option.setName("kick").setDescription("Choose whether the applicant is kicked from the server. (Default: true)"),
    ),
  run: async (interaction) => {
    await interaction.deferReply()

    const applicantChannel = interaction.options.getChannel("channel", true, [ChannelType.GuildText])

    const commonDetails = await getApplicantChannelDetails(applicantChannel)
    if (isErr(commonDetails)) throw new Error(commonDetails.messageChain)

    const { settings, applicant } = commonDetails

    if (!applicant.memberId) {
      void interaction.editReply(
        components.warn(
          "Applicant has not joined the server or has not been linked (`/link`). To delete the channel, use `/delete`",
        ),
      )
      return
    }

    const declineMessageText = interaction.options.getString("decline-message") ?? settings.declineMessage
    // Only kick if not false. i.e. kick is true if option is true or null
    const kick = interaction.options.getBoolean("kick") !== false
    const kickText = kick ? " and you will be removed from the server." : "."

    const declineConfirmButton = new PrimaryButtonBuilder().setCustomId("declineConfirm").setLabel("Confirm")
    const row = new ActionRowBuilder().addComponents(declineConfirmButton)

    const declineMessage = await applicantChannel.send({
      content: `<@${applicant.memberId}>\n\n${declineMessageText}\n\nUpon clicking Confirm, your application will be closed${kickText}`,
      components: [row],
    })

    applicant.kick = kick
    applicant.declineMessageId = declineMessage.id
    const saveApplicantResult = await saveApplicant(applicant)
    if (isErr(saveApplicantResult)) throw new Error(saveApplicantResult.messageChain)

    await interaction.editReply(`\`${applicantChannel.name}\` has been declined.\n${declineMessageText}`)
  },
}
