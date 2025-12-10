import { Events } from "discord.js"
import type { Event } from "discord-bot-shared"

import type { GuildSettings } from "~/generated/prisma/client.ts"
import { saveSettings } from "~/settings/settings-db.ts"
import { getSettingsContainer } from "~/settings/settings-service.ts"

export const settingsModalSubmit: Event = {
  event: Events.InteractionCreate,
  async handler(_, interaction) {
    if (!(interaction.isModalSubmit() && interaction.isFromMessage())) return
    if (!interaction.guild) return

    const updatedSettings: Partial<GuildSettings> = {}

    if (interaction.customId === "roleSettingsModal") {
      updatedSettings.officerRoleIds =
        interaction.fields
          .getSelectedRoles("officerRoles", false)
          ?.map((role) => role?.id)
          .join(",") ?? null

      updatedSettings.applicantRoleId = interaction.fields.getSelectedRoles("applicantRole")?.at(0)?.id ?? null
    }

    if (interaction.customId === "channelSettingsModal") {
      updatedSettings.appsChannelId = interaction.fields.getSelectedChannels("appsChannel")?.at(0)?.id ?? null
      updatedSettings.appsCategoryId = interaction.fields.getSelectedChannels("appsCategory")?.at(0)?.id ?? null
    }

    if (interaction.customId === "messageSettingsModal") {
      updatedSettings.declineMessage = interaction.fields.getTextInputValue("declineMessage")
    }

    if (interaction.customId === "postLogsSettingsModal") {
      updatedSettings.postLogs = interaction.fields.getStringSelectValues("postLogs").at(0) === "true"
      updatedSettings.postLogsChannelId = interaction.fields.getSelectedChannels("postLogsChannel")?.at(0)?.id ?? null
    }

    if (Object.keys(updatedSettings).length === 0) return

    await saveSettings(interaction.guild.id, updatedSettings)
    await interaction.update({ components: [await getSettingsContainer(interaction.guild)] })
  },
}
