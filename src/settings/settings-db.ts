import type { GuildSettings } from "@prisma/client"

import { prisma } from "~/db.ts"

/**
 * @param guildId The ID of the guild
 * @returns The settings
 */
export async function getSettingsOrThrow(guildId: string) {
  return await prisma.guildSettings.findUniqueOrThrow({
    where: {
      id: guildId,
    },
  })
}

/**
 * @param guildId The ID of the guild
 * @returns The settings
 */
export async function getSettings(guildId: string) {
  return await prisma.guildSettings.findUnique({
    where: {
      id: guildId,
    },
  })
}

/**
 * @param settings The settings to save
 */
export async function saveSettings(settings: GuildSettings) {
  await prisma.guildSettings.upsert({
    where: {
      id: settings.id,
    },
    update: settings,
    create: settings,
  })
}
