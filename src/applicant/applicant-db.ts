import type { Applicant } from "@prisma/client"
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library"
import { throwError } from "discord-bot-shared"

import { prisma } from "~/db.ts"

/**
 * @param username The username of the applicant
 * @param guildId The ID of the guild
 * @returns The applicant
 */
async function getApplicantOrThrow(username: string, guildId: string) {
  try {
    return await prisma.applicant.findUniqueOrThrow({
      where: {
        username,
        guildId,
      },
    })
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError && error.code === "P2025")
      throwError(`Failed to find applicant in database with username: ${username}`)
    else throw error
  }
}

/**
 * @param username The username of the applicant
 * @param guildId The ID of the guild
 * @returns The applicant
 */
async function getApplicant(username: string, guildId: string) {
  return await prisma.applicant.findUnique({
    where: {
      username,
      guildId,
    },
  })
}

/**
 * @param applicant The applicant to save
 */
async function saveApplicant(applicant: Applicant) {
  await prisma.applicant.upsert({
    where: { username: applicant.username, guildId: applicant.guildId },
    update: applicant,
    create: applicant,
  })
}

/**
 * @param applicant The applicant to remove
 */
async function removeApplicant(applicant: Applicant) {
  await prisma.applicant.delete({
    where: {
      username: applicant.username,
      guildId: applicant.guildId,
    },
  })
}

export { getApplicant, getApplicantOrThrow, removeApplicant, saveApplicant }
