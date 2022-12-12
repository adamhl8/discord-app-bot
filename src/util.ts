import { getChannel, throwError } from "discord-bot-shared"
import { ChannelType, GuildMember, TextChannel } from "discord.js"
import getUrls from "get-urls"
import { getSettings } from "./commands/settings.js"

async function isModerator(member: GuildMember) {
  if (!member.guild.id) throwError("Unable to get guild ID.")
  const isAdmin = member.permissions.has("Administrator")
  const settings = await getSettings(member.guild.id)
  if (!settings) return isAdmin
  const roles = member.roles.cache
  const officerRoleId = settings.officerRole.id

  return roles.has(officerRoleId) || isAdmin
}

async function sendWarcraftlogsEmbed(member: GuildMember, warcraftlogs: string) {
  if (!member.guild.id) throwError("Unable to get guild ID.")
  const settings = (await getSettings(member.guild.id)) || throwError("Unable to get settings.")

  const warcraftlogsUrls = getUrls(warcraftlogs)
  let warcraftlogsText = `\n\n`
  for (const url of warcraftlogsUrls) {
    warcraftlogsText += `${url}\n`
  }

  if (!settings.postLogsChannel) throwError("Unable to get post logs channel.")
  const postLogsChannel =
    (await getChannel<TextChannel>(settings.postLogsChannel.id, ChannelType.GuildText, member.guild.id)) ||
    throwError("Unable to get members channel.")
  await postLogsChannel.send(`New Applicant: ${member.toString()}${warcraftlogsText}`)
}

export { isModerator, sendWarcraftlogsEmbed }
