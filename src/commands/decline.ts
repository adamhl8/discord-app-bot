import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, SlashCommandBuilder } from "discord.js"
import type { Command } from "discord-bot-shared"
import { components } from "discord-bot-shared"
import { isErr } from "ts-explicit-errors"

import { saveApplicant } from "~/applicant/applicant-db.ts"
import { getApplicantChannelDetails } from "~/applicant/applicant-service.ts"

export const decline: Command = {
  command: new SlashCommandBuilder()
    .setName("decline")
    .setDescription("Decline an applicant.")
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("Select the channel of the applicant you wish to decline.")
        .setRequired(true),
    )
    .addStringOption((option) =>
      option.setName("decline-message").setDescription("Leave blank to send the default decline message."),
    )
    .addBooleanOption((option) =>
      option.setName("kick").setDescription("Choose whether the applicant is kicked from the server. (Default: true)"),
    ),
  run: async (interaction) => {
    await interaction.deferReply()

    const applicantChannel = interaction.options.getChannel("channel", true, [ChannelType.GuildText])

    const commonDetails = await getApplicantChannelDetails(applicantChannel)
    if (isErr(commonDetails)) throw new Error(commonDetails.messageChain)

    const { settings, applicant } = commonDetails

    if (!applicant.memberId) {
      interaction.editReply(
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

    const declineConfirmButton = new ButtonBuilder()
      .setCustomId("declineConfirm")
      .setLabel("Confirm")
      .setStyle(ButtonStyle.Primary)
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(declineConfirmButton)

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
