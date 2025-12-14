import type { CategoryChannel, Guild, GuildTextBasedChannel, Role } from "discord.js"
import type { Result } from "ts-explicit-errors"
import { attempt, err, filterMap, isErr } from "ts-explicit-errors"
import type { SetNonNullable, Simplify } from "type-fest"

import { prisma } from "~/db.ts"
import type { GuildSettings } from "~/generated/prisma/client.ts"
import { getGuildCategory, getGuildTextChannel } from "~/guild-utils.ts"

export interface ResolvedGuildSettings extends SetNonNullable<GuildSettings> {
  officerRoles: Role[]
  applicantRole: Role
  appsChannel: GuildTextBasedChannel
  appsCategory: CategoryChannel
}

/**
 * @param guildId The ID of the guild
 * @returns The settings
 */
export async function getSettings(guild: Guild): Promise<Result<GuildSettings>> {
  let settings = await prisma.guildSettings.findUnique({
    where: {
      id: guild.id,
    },
  })

  // initialize settings for the guild if they don't exist
  if (!settings) {
    const initialSettings = await saveSettings(guild, {})
    if (isErr(initialSettings)) return err("failed to initialize settings", initialSettings)
    settings = initialSettings
  }

  return settings
}

/**
 * @param guildId The ID of the guild
 * @returns The settings
 */
export async function getResolvedSettings(guild: Guild): Promise<Result<ResolvedGuildSettings>> {
  const settings = await getSettings(guild)
  if (isErr(settings)) return settings

  const { values: missingSettings } = filterMap(Object.entries(settings), ([key, value]) => {
    if (value === null || value === undefined) return key
    return
  })
  if (missingSettings.length > 0)
    return err(
      `The following settings have not been set. Please run the \`/settings\` command.\n${missingSettings.map((key) => `\`${key}\``).join("\n")}`,
      undefined,
    )

  // fix me
  const nonNullSettings = settings as Simplify<SetNonNullable<GuildSettings>>

  const officerRoleIds = nonNullSettings.officerRoleIds.split(",")
  const { values: officerRoles, errors: officerRoleErrors } = await filterMap(officerRoleIds, async (id) => {
    const role = await attempt(() => guild.roles.fetch(id))
    if (isErr(role)) return err(`failed to fetch officer role with ID '${id}'`, role)
    if (!role) return
    return role
  })
  if (officerRoleErrors)
    return err(
      `failed to fetch all officer roles:\n${officerRoleErrors.map((error) => error.messageChain).join("\n")}`,
      undefined,
    )

  const applicantRole = await attempt(() => guild.roles.fetch(nonNullSettings.applicantRoleId))
  if (isErr(applicantRole))
    return err(`failed to fetch applicant role with ID '${nonNullSettings.applicantRoleId}'`, applicantRole)
  if (!applicantRole)
    return err(`failed to find applicant role with ID '${nonNullSettings.applicantRoleId}'`, undefined)

  const appsChannel = await getGuildTextChannel(guild, nonNullSettings.appsChannelId)
  if (isErr(appsChannel))
    return err(`failed to get apps channel with ID '${nonNullSettings.appsChannelId}'`, appsChannel)

  const appsCategory = await getGuildCategory(guild, nonNullSettings.appsCategoryId)
  if (isErr(appsCategory))
    return err(`failed to get apps category with ID '${nonNullSettings.appsCategoryId}'`, appsCategory)

  return {
    ...nonNullSettings,
    officerRoles,
    applicantRole,
    appsChannel,
    appsCategory,
  }
}

/**
 * @param settings The settings to save
 */
export async function saveSettings({ id }: Guild, settings: Partial<GuildSettings>): Promise<Result<GuildSettings>> {
  const newSettings = await attempt(() =>
    prisma.guildSettings.upsert({
      where: {
        id,
      },
      update: settings,
      create: { ...settings, id },
    }),
  )

  if (isErr(newSettings)) return err("failed to save settings", newSettings)

  return newSettings
}
