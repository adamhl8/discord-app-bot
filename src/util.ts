import { GuildSettings } from "@prisma/client"
import { getChannel } from "discord-bot-shared"
import { ChannelType, Guild, GuildMember } from "discord.js"
import getUrls from "get-urls"
import { getSettings } from "./settings/settings-db.js"
import prisma from "./storage.js"

async function isModerator(member: GuildMember) {
  const isAdmin = member.permissions.has("Administrator")
  if (!(await prisma.guildSettings.findUnique({ where: { id: member.guild.id } }))) return isAdmin
  const settings = await getSettings(member.guild.id)
  const officerRoleId = settings.officerRoleId
  const roles = member.roles.cache

  return roles.has(officerRoleId) || isAdmin
}

async function sendWarcraftlogsMessage(
  guild: Guild,
  settings: GuildSettings,
  memberMention: string,
  warcraftlogs: string,
) {
  if (!(settings.postLogs && settings.postLogsChannelId)) return

  const warcraftlogsUrls = getUrls(warcraftlogs)
  let warcraftlogsText = `\n\n`
  for (const url of warcraftlogsUrls) {
    warcraftlogsText += `${url}\n`
  }

  const postLogsChannel = await getChannel(guild, settings.postLogsChannelId, ChannelType.GuildText)

  await postLogsChannel.send(`New Applicant: ${memberMention}${warcraftlogsText}`)
}

export { isModerator, sendWarcraftlogsMessage }
