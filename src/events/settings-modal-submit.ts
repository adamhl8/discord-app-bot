import { Events } from "discord.js"
import type { Event } from "discord-bot-shared"
import { isErr } from "ts-explicit-errors"

import { getSettingsContainer } from "~/commands/settings.ts"
import type { GuildSettings } from "~/generated/prisma/client.ts"
import { saveSettings } from "~/settings/settings-db.ts"

export const settingsModalSubmit: Event = {
  event: Events.InteractionCreate,
  handler: async (_, interaction) => {
    if (!(interaction.isModalSubmit() && interaction.isFromMessage())) return

    const { guild, customId, fields } = interaction
    if (!guild) throw new Error("guild is null")

    const updatedSettings: Partial<GuildSettings> = {}

    if (customId === "roleSettingsModal") {
      updatedSettings.officerRoleIds =
        fields
          .getSelectedRoles("officerRoles", false)
          ?.map((role) => role?.id)
          .join(",") ?? null

      updatedSettings.applicantRoleId = fields.getSelectedRoles("applicantRole")?.at(0)?.id ?? null
    }

    if (customId === "channelSettingsModal") {
      updatedSettings.appsChannelId = fields.getSelectedChannels("appsChannel")?.at(0)?.id ?? null
      updatedSettings.appsCategoryId = fields.getSelectedChannels("appsCategory")?.at(0)?.id ?? null
    }

    if (customId === "messageSettingsModal") {
      updatedSettings.declineMessage = fields.getTextInputValue("declineMessage")
    }

    if (customId === "postLogsSettingsModal") {
      updatedSettings.postLogs = fields.getStringSelectValues("postLogs").at(0) === "true"
      updatedSettings.postLogsChannelId = fields.getSelectedChannels("postLogsChannel")?.at(0)?.id ?? null
    }

    const saveSettingsResult = await saveSettings(guild, updatedSettings)
    if (isErr(saveSettingsResult)) throw new Error(saveSettingsResult.messageChain)

    const settingsContainer = await getSettingsContainer(guild)
    if (isErr(settingsContainer)) throw new Error(settingsContainer.messageChain)

    await interaction.update({ components: [settingsContainer] })
  },
}
