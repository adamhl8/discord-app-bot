import { throwError } from "discord-bot-shared"
import { Guild, GuildMember } from "discord.js"
import { getSettings } from "./settings/settings-db.js"

async function isModerator(member: GuildMember) {
  const isAdmin = member.permissions.has("Administrator")
  const settings = await getSettings(member.guild.id)
  if (!settings) return isAdmin
  const officerRoleId = settings.officerRoleId

  return member.roles.cache.has(officerRoleId) || isAdmin
}

async function fetchMemberById(guild: Guild, id: string) {
  const members = await guild.members.fetch()
  return members.get(id) ?? throwError(`Failed to get member with ID: ${id}`)
}

export { fetchMemberById, isModerator }
