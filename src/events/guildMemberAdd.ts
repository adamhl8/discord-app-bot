import { getApplicant, parseApplicantName, saveApplicant } from '../applicant.js'
import { checkSettings, Settings } from '../commands/settings.js'
import bot from '../index.js'
import storage from '../storage.js'

bot.on('guildMemberAdd', async (member) => {
  if (!(await checkSettings())) return
  const settings = storage.getObject<Settings>('/settings')

  const name = parseApplicantName(member.user.tag)

  const applicant = getApplicant(name)
  if (!applicant) return console.error(`applicant does not exist: ${name}`)

  applicant.memberId = member.id
  saveApplicant(applicant)

  await member.roles.add(settings.applicantRole.id).catch(console.error)

  const channel = await member.guild.channels.fetch(applicant.channelId)
  if (!channel || channel.type !== 'GUILD_TEXT')
    throw new Error(`channel does not exist for applicant: ${applicant.tag}`)

  await channel.permissionOverwrites.create(member.user, { VIEW_CHANNEL: true })

  const appResponse =
    `<@${applicant.memberId}` +
    '>\n\n' +
    'Thank you for your application. Once a decision has been made, you will be messaged/pinged with a response.'
  await channel.send(appResponse).catch(console.error)
})
