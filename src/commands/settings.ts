import { SlashCommandBuilder } from "discord.js"
import type { Command } from "discord-bot-shared"

import { listSettings } from "~/settings/settings-service.ts"

export const settings: Command = {
  command: new SlashCommandBuilder().setName("settings").setDescription("Configure app-bot.").toJSON(),
  async run(interaction) {
    await listSettings(interaction)
  },
}
