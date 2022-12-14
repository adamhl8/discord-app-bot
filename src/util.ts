import { Guild, throwError } from "discord-bot-shared"
import { ChannelType, GuildMember, TextChannel } from "discord.js"
import getUrls from "get-urls"
import { getSettings, Settings } from "./commands/settings.js"
import { getGuildCollection } from "./index.js"

interface GuildInfo {
  guild: Guild
  settings: Settings | undefined
}

async function getGuildInfo(guildId: string): Promise<GuildInfo> {
  const GuildCollection = getGuildCollection()
  const guild = GuildCollection.get(guildId) || throwError("Unable to get guild.")
  const settings = await getSettings(guild.id)
  return { guild, settings }
}

async function isModerator(member: GuildMember) {
  if (!member.guild.id) throwError("Unable to get guild ID.")
  const isAdmin = member.permissions.has("Administrator")
  const settings = await getSettings(member.guild.id)
  if (!settings) return isAdmin
  const roles = member.roles.cache
  const officerRoleId = settings.officerRole.id

  return roles.has(officerRoleId) || isAdmin
}

async function sendWarcraftlogsMessage(guildInfo: GuildInfo, memberMention: string, warcraftlogs: string) {
  const { guild, settings } = guildInfo
  if (!settings) return

  if (!(settings.postLogs && settings.postLogsChannel)) return

  const warcraftlogsUrls = getUrls(warcraftlogs)
  let warcraftlogsText = `\n\n`
  for (const url of warcraftlogsUrls) {
    warcraftlogsText += `${url}\n`
  }

  const postLogsChannel =
    (await guild.getChannel<TextChannel>(settings.postLogsChannel.id, ChannelType.GuildText)) ||
    throwError("Unable to get post logs channel.")

  await postLogsChannel.send(`New Applicant: ${memberMention}${warcraftlogsText}`)
}

export { getGuildInfo, isModerator, sendWarcraftlogsMessage }
