import { SlashCommandBuilder } from "discord.js"
import type { Command } from "discord-bot-shared"

import { deleteApplicant } from "~/applicant/delete-applicant.ts"

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
    .addStringOption((option) => option.setName("reason").setDescription("Provide a reason for deletion."))
    .toJSON(),
  run: deleteApplicant,
}
