import { getApplicant, parseApplicantName, saveApplicant } from '../applicant.js'
import { getSettings } from '../commands/settings.js'
import bot from '../index.js'

bot.on('guildMemberAdd', async (member) => {
  const name = parseApplicantName(member.user.tag)
  if (!name) return

  const applicant = getApplicant(name)
  if (!applicant) return

  const settings = getSettings()
  if (!settings) return

  await member.roles.add(settings.applicantRole.id).catch(console.error)

  applicant.memberId = member.id
  saveApplicant(applicant)

  const channel = await member.guild.channels.fetch(applicant.channelId)
  if (!channel || channel.type !== 'GUILD_TEXT') return console.error('Unable to get channel.')

  await channel.permissionOverwrites.create(member.user, { VIEW_CHANNEL: true }).catch(console.error)

  const appResponse =
    `<@${applicant.memberId}>\n\n` +
    'Thank you for your application. Once a decision has been made, you will be messaged/pinged with a response.'
  await channel.send(appResponse).catch(console.error)
})
