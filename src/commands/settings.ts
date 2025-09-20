import { SlashCommandBuilder } from "discord.js"
import type { Command } from "discord-bot-shared"

import { listSettings, setSettings } from "~/settings/settings-service.ts"

export const settings: Command = {
  command: new SlashCommandBuilder()
    .setName("settings")
    .setDescription("Configure app-bot.")
    .addSubcommand((subcommand) => subcommand.setName("list").setDescription("List current settings."))
    .addSubcommand((subcommand) =>
      subcommand
        .setName("set")
        .setDescription("Set all app-bot settings.")
        .addRoleOption((option) =>
          option
            .setName("officer-role")
            .setDescription("Members must have this role to interact with app-bot.")
            .setRequired(true),
        )
        .addRoleOption((option) =>
          option.setName("applicant-role").setDescription("The role given to each applicant.").setRequired(true),
        )
        .addChannelOption((option) =>
          option.setName("apps-channel").setDescription("The channel where applications are posted.").setRequired(true),
        )
        .addChannelOption((option) =>
          option
            .setName("apps-category")
            .setDescription("The channel category where applicant channels will be created.")
            .setRequired(true),
        )
        .addStringOption((option) =>
          option
            .setName("decline-message")
            .setDescription("The message sent to the applicant upon using the /decline command.")
            .setRequired(true),
        )
        .addBooleanOption((option) =>
          option
            .setName("post-logs")
            .setDescription("If the applicant's Warcraft Logs should be posted (to members-channel).")
            .setRequired(true),
        )
        .addChannelOption((option) =>
          option
            .setName("post-logs-channel")
            .setDescription("The channel where the applicant's Warcraft Logs will be posted."),
        ),
    )
    .toJSON(),
  async run(interaction) {
    const subcommand = interaction.options.getSubcommand()
    if (subcommand === "list") await listSettings(interaction)
    if (subcommand === "set") await setSettings(interaction)
  },
}
