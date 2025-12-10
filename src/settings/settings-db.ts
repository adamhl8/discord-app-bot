import { prisma } from "~/db.ts"
import type { GuildSettings } from "~/generated/prisma/client.ts"

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
export async function saveSettings(guildId: string, settings: Partial<GuildSettings>) {
  await prisma.guildSettings.upsert({
    where: {
      id: guildId,
    },
    update: settings,
    create: { ...settings, id: guildId },
  })
}
