import { GuildMember, Permissions } from 'discord.js'
import { getSettings } from './commands/settings.js'

function isModerator(member: GuildMember) {
  const isAdmin = member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)
  const settings = getSettings()
  if (!settings) return isAdmin
  const roles = member.roles.cache
  const officerRoleId = settings.officerRole.id

  return roles.has(officerRoleId) || isAdmin
}

export { isModerator }
