import { getApplicant, removeApplicant } from '../applicant.js'
import { checkSettings, Settings } from '../commands/settings.js'
import bot from '../index.js'
import storage from '../storage.js'

bot.on('messageReactionAdd', async (reaction, user) => {
  if (!(await checkSettings())) return
  const settings = storage.getObject<Settings>('/settings')

  if (reaction.partial) await reaction.fetch().catch(console.error)
  if (user.partial) await user.fetch().catch(console.error)

  const channel = reaction.message.channel
  if (!channel || channel.type !== 'GUILD_TEXT') return

  const applicant = getApplicant(channel.name)
  if (!applicant) return

  if (reaction.message.id !== applicant.declineMessageId) return

  if (!reaction.message.guild) return console.error(`Unable to get guild.`)
  const guildMember = await reaction.message.guild.members.fetch(user.id).catch(console.error)
  if (!guildMember) return console.error(`Unable to get guild member.`)

  const officerRoleId = settings.officerRole.id
  if (!(guildMember.id === applicant.memberId || guildMember.roles.cache.has(officerRoleId))) return

  await channel.delete().catch(console.error)

  if (!applicant.memberId) return
  const member = await reaction.message.guild.members.fetch(applicant.memberId).catch(console.error)
  if (!member) return console.error(`Unable to get member.`)

  await member.kick().catch(console.error)

  removeApplicant(applicant)
})
