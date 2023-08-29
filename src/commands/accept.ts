import { Command } from "discord-bot-shared"
import { SlashCommandBuilder } from "discord.js"
import { acceptApplicant } from "../applicant/applicant-service.js"

const accept: Command = {
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

export default accept
