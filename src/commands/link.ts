import { Command } from "discord-bot-shared"
import { SlashCommandBuilder } from "discord.js"
import linkApplicant from "../applicant/link-applicant.js"

const link: Command = {
  command: new SlashCommandBuilder()
    .setName("link")
    .setDescription("Link an applicant.")
    .addUserOption((option) =>
      option
        .setName("applicant")
        .setDescription("The applicant to be linked to the selected channel.")
        .setRequired(true),
    )
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("Select the channel that the applicant will be linked to.")
        .setRequired(true),
    )
    .toJSON(),
  run: linkApplicant,
}

export default link
