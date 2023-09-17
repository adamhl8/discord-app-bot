import { GuildSettings } from "@prisma/client"
import prisma from "../db.js"

async function getSettingsOrThrow(guildId: string) {
  return await prisma.guildSettings.findUniqueOrThrow({
    where: {
      id: guildId,
    },
  })
}

async function getSettings(guildId: string) {
  return await prisma.guildSettings.findUnique({
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
    update: settings,
    create: settings,
  })
}

export { getSettings, getSettingsOrThrow, saveSettings }
