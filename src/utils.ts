import type { GuildMember } from "discord.js"
import type { Result } from "ts-explicit-errors"
import { isErr } from "ts-explicit-errors"

import { getSettings } from "#/settings/settings-db.ts"

/** Whether the member is an admin or has one of the configured officer roles */
export const isModerator = async (member: GuildMember): Promise<Result<boolean>> => {
  const isAdmin = member.permissions.has("Administrator")
  const settings = await getSettings(member.guild)
  if (isErr(settings)) return settings

  if (!settings.officerRoleIds) return isAdmin
  const officerRoleIds = settings.officerRoleIds.split(",")

  return officerRoleIds.some((roleId) => member.roles.cache.has(roleId)) || isAdmin
}
