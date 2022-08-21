import { getChannel, throwError } from 'discord-bot-shared'
import { ChannelType, GuildMember, TextChannel } from 'discord.js'
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

  const membersChannel = (await getChannel<TextChannel>('members', ChannelType.GuildText)) || throwError('Unable to get members channel.')
  await membersChannel.send(`New Applicant: ${memberMention}${warcraftlogsText}`)
}

export { isModerator, sendWarcraftlogsEmbed }
