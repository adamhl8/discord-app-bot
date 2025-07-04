import { SlashCommandBuilder } from "discord.js"
import type { Command } from "discord-bot-shared"

import { acceptApplicant } from "@/applicant/accept-applicant.ts"

export const accept: Command = {
  command: new SlashCommandBuilder()
    .setName("accept")
    .setDescription("Accept an applicant.")
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("Select the channel of the applicant you wish to accept.")
        .setRequired(true),
    )
    .toJSON(),
  run: acceptApplicant,
}
