import { ChannelType, SlashCommandBuilder } from "discord.js"
import type { Command } from "discord-bot-shared"
import { err, isErr } from "ts-explicit-errors"

import { closeApplication } from "~/applicant/applicant-service.ts"

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

    const closeApplicationResult = await closeApplication(applicantChannel, "declined")
    if (isErr(closeApplicationResult))
      throw new Error(err("failed to close application", closeApplicationResult).messageChain)

    const reason = interaction.options.getString("reason") ?? ""
    await interaction.editReply(`\`${applicantChannel.name}\` has been deleted.\n${reason}`)
  },
}
