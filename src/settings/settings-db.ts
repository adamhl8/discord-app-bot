import prisma from "../storage.js"

export interface GuildSettings {
  id: string
  officerRoleId: string
  applicantRoleId: string
  appsChannelId: string
  appsCategoryId: string
  declineMessage: string
  postLogs: boolean
  postLogsChannel: string | null
}

async function getSettings(guildId: string): Promise<GuildSettings> {
  return await prisma.guild.findUniqueOrThrow({
    where: {
      id: guildId,
    },
  })
}

export { getSettings }
