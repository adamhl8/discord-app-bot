import { GuildSettings } from "@prisma/client"
import prisma from "../storage.js"

async function getSettings(guildId: string): Promise<GuildSettings> {
  return await prisma.guildSettings.findUniqueOrThrow({
    where: {
      id: guildId,
    },
  })
}

async function saveSettings(settings: GuildSettings) {
  await prisma.guildSettings.upsert({
    where: {
      id: settings.id,
    },
    update: {
      ...settings,
    },
    create: {
      ...settings,
    },
  })
}

export { getSettings, saveSettings }
