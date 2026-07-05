import type { Event } from "discord-bot-shared"
import type { ModalComponentResolver } from "discord.js"
import { Events } from "discord.js"
import { isErr } from "ts-explicit-errors"

import { getSettingsContainer } from "#/commands/settings.ts"
import type { GuildSettings } from "#/generated/prisma/client.ts"
import { saveSettings } from "#/settings/settings-db.ts"

const getUpdatedSettings = (customId: string, components: ModalComponentResolver): Partial<GuildSettings> => {
  const updatedSettings: Partial<GuildSettings> = {}

  if (customId === "roleSettingsModal") {
    updatedSettings.officerRoleIds =
      components
        .getSelectedRoles("officerRoles", false)
        ?.map((role) => role?.id)
        .join(",") ?? null

    updatedSettings.applicantRoleId = components.getSelectedRoles("applicantRole")?.at(0)?.id ?? null
  }

  if (customId === "channelSettingsModal") {
    updatedSettings.appsChannelId = components.getSelectedChannels("appsChannel")?.at(0)?.id ?? null
    updatedSettings.appsCategoryId = components.getSelectedChannels("appsCategory")?.at(0)?.id ?? null
  }

  if (customId === "messageSettingsModal")
    updatedSettings.declineMessage = components.getTextInputValue("declineMessage")

  if (customId === "postLogsSettingsModal") {
    updatedSettings.postLogs = components.getStringSelectValues("postLogs").at(0) === "true"
    updatedSettings.postLogsChannelId = components.getSelectedChannels("postLogsChannel")?.at(0)?.id ?? null
  }

  return updatedSettings
}

export const settingsModalSubmit: Event = {
  event: Events.InteractionCreate,
  handler: async (_, interaction) => {
    if (!(interaction.isModalSubmit() && interaction.isFromMessage())) return

    const { guild, customId, components } = interaction
    if (!guild) throw new Error("guild is null")

    const updatedSettings = getUpdatedSettings(customId, components)

    const saveSettingsResult = await saveSettings(guild, updatedSettings)
    if (isErr(saveSettingsResult)) throw new Error(saveSettingsResult.messageChain)

    const settingsContainer = await getSettingsContainer(guild)
    if (isErr(settingsContainer)) throw new Error(settingsContainer.messageChain)

    await interaction.update({ components: [settingsContainer] })
  },
}
