import type { Guild } from "discord.js"
import type { Result } from "ts-explicit-errors"
import { attempt, err, isErr } from "ts-explicit-errors"

import { prisma } from "#db.ts"
import type { Applicant } from "#generated/prisma/client.ts"

export const getApplicant = async (username: string, guild: Guild): Promise<Result<Applicant>> => {
  const applicant = await prisma.applicant.findUnique({
    where: {
      username,
      guildId: guild.id,
    },
  })

  if (!applicant) return err(`failed to get applicant '${username}'`, undefined)

  return applicant
}

export const saveApplicant = async (applicant: Applicant): Promise<Result> => {
  const result = await attempt(async () =>
    prisma.applicant.upsert({
      where: { username: applicant.username, guildId: applicant.guildId },
      update: applicant,
      create: applicant,
    }),
  )

  if (isErr(result)) return err(`failed to save applicant '${applicant.username}'`, result)
}

export const removeApplicant = async (applicant: Applicant): Promise<Result> => {
  const result = await attempt(async () =>
    prisma.applicant.delete({
      where: {
        username: applicant.username,
        guildId: applicant.guildId,
      },
    }),
  )

  if (isErr(result)) return err(`failed to remove applicant '${applicant.username}'`, result)
}
