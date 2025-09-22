import type { Guild, GuildMember } from "discord.js"
import { throwError } from "discord-bot-shared"

import { getSettings } from "~/settings/settings-db.ts"

/**
 * @param member The member to check
 * @returns Whether the member is a moderator
 */
export async function isModerator(member: GuildMember) {
  const isAdmin = member.permissions.has("Administrator")
  const settings = await getSettings(member.guild.id)
  if (!settings) return isAdmin
  const officerRoleId = settings.officerRoleId

  return member.roles.cache.has(officerRoleId) || isAdmin
}

/**
 * @param guild The guild
 * @param id The ID of the member
 * @returns The member
 */
export async function fetchMemberById(guild: Guild, id: string) {
  const members = await guild.members.fetch()
  return members.get(id) ?? throwError(`Failed to get member with ID: ${id}`)
}
