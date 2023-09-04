import { Applicant } from "@prisma/client"
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library.js"
import { throwError } from "discord-bot-shared"
import prisma from "../storage.js"

async function getApplicant(username: string, guildId: string) {
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

async function saveApplicant(applicant: Applicant) {
  await prisma.applicant.upsert({
    where: { username: applicant.username },
    update: {
      ...applicant,
    },
    create: {
      ...applicant,
    },
  })
}

async function removeApplicant(applicant: Applicant) {
  await prisma.applicant.delete({
    where: {
      username: applicant.username,
      guildId: applicant.guildId,
    },
  })
}

export { getApplicant, removeApplicant, saveApplicant }
