import type { Guild } from "discord.js"
import type { Result } from "ts-explicit-errors"
import { attempt, err, isErr } from "ts-explicit-errors"

import { prisma } from "~/db.ts"
import type { Applicant } from "~/generated/prisma/client.ts"

/**
 * @param username The username of the applicant
 * @param guild The guild of the applicant
 * @returns The applicant
 */
export async function getApplicant(username: string, guild: Guild): Promise<Result<Applicant>> {
  const applicant = await prisma.applicant.findUnique({
    where: {
      username,
      guildId: guild.id,
    },
  })

  if (!applicant) return err(`failed to get applicant '${username}'`, undefined)

  return applicant
}

/**
 * @param applicant The applicant to save
 */
export async function saveApplicant(applicant: Applicant): Promise<Result> {
  const result = await attempt(() =>
    prisma.applicant.upsert({
      where: { username: applicant.username, guildId: applicant.guildId },
      update: applicant,
      create: applicant,
    }),
  )

  if (isErr(result)) return err(`failed to save applicant '${applicant.username}'`, result)
}

/**
 * @param applicant The applicant to remove
 */
export async function removeApplicant(applicant: Applicant): Promise<Result> {
  const result = await attempt(() =>
    prisma.applicant.delete({
      where: {
        username: applicant.username,
        guildId: applicant.guildId,
      },
    }),
  )

  if (isErr(result)) return err(`failed to remove applicant '${applicant.username}'`, result)
}
