import { getGuildCache, isTextChannel, throwError } from 'discord-bot-shared'
import { GuildMember } from 'discord.js'
import { appResponse, getApplicant, parseApplicantName, saveApplicant } from '../applicant.js'
import { getSettings } from '../commands/settings.js'
import bot from '../index.js'
import { sendWarcraftlogsEmbed } from '../util.js'

bot.on('guildMemberAdd', (member) => {
  void handleGuildMemberAdd(member).catch(console.error)
})

async function handleGuildMemberAdd(member: GuildMember) {
  const name = parseApplicantName(member.user.tag) || throwError('Unable to parse applicant name.')
  const applicant = getApplicant(name)
  if (!applicant) return
  const settings = getSettings() || throwError('Unable to get settings.')

  await member.roles.add(settings.applicantRole.id)
  applicant.memberId = member.id
  saveApplicant(applicant)

  const { channels } = (await getGuildCache()) || throwError('Unable to get guild cache.')
  const channel = channels.get(applicant.channelId) || throwError('Unable to get channel.')
  if (!isTextChannel(channel)) throwError('Channel is not a text channel.')

  await channel.permissionOverwrites.create(member.user, { ViewChannel: true })
  await channel.send(appResponse(member.toString()))

  if (applicant.warcraftlogs) await sendWarcraftlogsEmbed(member.toString(), applicant.warcraftlogs)
}
