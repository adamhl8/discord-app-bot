import { getGuildCache, isTextChannel, throwError } from 'discord-bot-shared'
import { EmbedBuilder, GuildMember } from 'discord.js'
import { getSettings } from './commands/settings.js'

function isModerator(member: GuildMember) {
  const isAdmin = member.permissions.has('Administrator')
  const settings = getSettings()
  if (!settings) return isAdmin
  const roles = member.roles.cache
  const officerRoleId = settings.officerRole.id

  return roles.has(officerRoleId) || isAdmin
}

async function sendWarcraftlogsEmbed(memberMention: string, warcraftlogs: string) {
  const warcraftlogsEmbed = new EmbedBuilder()
    .setTitle('New Applicant')
    .setDescription(`${memberMention}\n\n${warcraftlogs}`)

  const { channels } = (await getGuildCache()) || throwError('Unable to get guild cache.')
  const membersChannel =
    channels.find((channel) => channel.name === 'members') || throwError('Unable to get members channel.')
  if (!isTextChannel(membersChannel)) throwError('Channel is not a text channel.')

  await membersChannel.send({ embeds: [warcraftlogsEmbed] })
}

export { isModerator, sendWarcraftlogsEmbed }
