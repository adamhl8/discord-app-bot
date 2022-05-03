import { GuildMember, Permissions } from 'discord.js'
import { checkSettings, Settings } from './commands/settings.js'
import storage from './storage.js'

async function isModerator(member: GuildMember) {
  const isAdmin = member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)
  if (!(await checkSettings())) return isAdmin
  const settings = storage.getObject<Settings>('/settings')
  const roles = member.roles.cache
  const officerRoleId = settings.officerRole.id

  return roles.has(officerRoleId) || isAdmin
}

export { isModerator }
