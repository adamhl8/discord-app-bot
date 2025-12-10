import type { Guild, GuildMember } from "discord.js"

import { getSettings } from "~/settings/settings-db.ts"

/**
 * @param member The member to check
 * @returns Whether the member is a moderator
 */
export async function isModerator(member: GuildMember) {
  const isAdmin = member.permissions.has("Administrator")
  const settings = await getSettings(member.guild.id)
  if (!settings?.officerRoleIds) return isAdmin
  const officerRoleIds = settings.officerRoleIds.split(",") ?? []

  return officerRoleIds.some((roleId) => member.roles.cache.has(roleId)) || isAdmin
}

/**
 * @param guild The guild
 * @param id The ID of the member
 * @returns The member
 */
export async function fetchMemberById(guild: Guild, id: string) {
  const member = await guild.members.fetch({ user: id })
  return member
}
