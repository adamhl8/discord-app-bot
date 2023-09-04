import { Command } from "discord-bot-shared"
import { SlashCommandBuilder } from "discord.js"
import declineApplicant from "../applicant/decline-applicant.js"

const decline: Command = {
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
    )
    .toJSON(),
  run: declineApplicant,
}

export default decline
