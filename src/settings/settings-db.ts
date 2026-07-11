import type { CategoryChannel, Guild, GuildTextBasedChannel, Role } from "discord.js"
import type { Result } from "ts-explicit-errors"
import { attempt, err, filterMap, isErr } from "ts-explicit-errors"
import type { SetNonNullable, Simplify } from "type-fest"

import { prisma } from "#db.ts"
import type { GuildSettings } from "#generated/prisma/client.ts"
import { getGuildCategory, getGuildTextChannel } from "#guild-utils.ts"

export interface ResolvedGuildSettings extends SetNonNullable<GuildSettings> {
  officerRoles: Role[]
  applicantRole: Role
  appsChannel: GuildTextBasedChannel
  appsCategory: CategoryChannel
}

const isCompleteSettings = (settings: GuildSettings): settings is Simplify<SetNonNullable<GuildSettings>> =>
  Object.values(settings).every((value) => value !== null)

export const isUnsetSettings = (settings: GuildSettings): boolean =>
  Object.entries(settings).every(([key, value]) => key === "id" || value === null)

export const saveSettings = async ({ id }: Guild, settings: Partial<GuildSettings>): Promise<Result<GuildSettings>> => {
  const newSettings = await attempt(async () =>
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

export const getSettings = async (guild: Guild): Promise<Result<GuildSettings>> => {
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

export const getResolvedSettings = async (guild: Guild): Promise<Result<ResolvedGuildSettings>> => {
  const settings = await getSettings(guild)
  if (isErr(settings)) return settings

  if (!isCompleteSettings(settings)) {
    const missingSettings = Object.entries(settings)
      .filter(([, value]) => value === null)
      .map(([key]) => key)
    return err(
      `The following settings have not been set. Please run the \`/settings\` command.\n${missingSettings.map((key) => `\`${key}\``).join("\n")}`,
      undefined,
    )
  }

  const officerRoleIds = settings.officerRoleIds.split(",")
  const { values: officerRoles, errors: officerRoleErrors } = await filterMap(officerRoleIds, async (id) => {
    const role = await attempt(async () => guild.roles.fetch(id))
    if (isErr(role)) return err(`failed to fetch officer role with ID '${id}'`, role)
    return role
  })
  if (officerRoleErrors) {
    return err(
      `failed to fetch all officer roles:\n${officerRoleErrors.map((error) => error.messageChain).join("\n")}`,
      undefined,
    )
  }

  const applicantRole = await attempt(async () => guild.roles.fetch(settings.applicantRoleId))
  if (isErr(applicantRole))
    return err(`failed to fetch applicant role with ID '${settings.applicantRoleId}'`, applicantRole)

  const appsChannel = await getGuildTextChannel(guild, settings.appsChannelId)
  if (isErr(appsChannel)) return err(`failed to get apps channel with ID '${settings.appsChannelId}'`, appsChannel)

  const appsCategory = await getGuildCategory(guild, settings.appsCategoryId)
  if (isErr(appsCategory)) return err(`failed to get apps category with ID '${settings.appsCategoryId}'`, appsCategory)

  return {
    ...settings,
    officerRoles,
    applicantRole,
    appsChannel,
    appsCategory,
  }
}
