import { getGuildCache, isTextChannel, throwError } from 'discord-bot-shared'
import { GuildMember } from 'discord.js'
import getUrls from 'get-urls'
import { getSettings } from './commands/settings.js'

async function isModerator(member: GuildMember) {
  const isAdmin = member.permissions.has('Administrator')
  const settings = await getSettings()
  if (!settings) return isAdmin
  const roles = member.roles.cache
  const officerRoleId = settings.officerRole.id

  return roles.has(officerRoleId) || isAdmin
}

async function sendWarcraftlogsEmbed(memberMention: string, warcraftlogs: string) {
  const warcraftlogsUrls = getUrls(warcraftlogs)
  let warcraftlogsText = `\n\n`
  for (const url of warcraftlogsUrls) {
    warcraftlogsText += `${url}\n`
  }

  const { channels } = (await getGuildCache()) || throwError('Unable to get guild cache.')
  const membersChannel =
    channels.find((channel) => channel.name === 'members') || throwError('Unable to get members channel.')
  if (!isTextChannel(membersChannel)) throwError('Channel is not a text channel.')

  await membersChannel.send(`New Applicant: ${memberMention}${warcraftlogsText}`)
}

export { isModerator, sendWarcraftlogsEmbed }
