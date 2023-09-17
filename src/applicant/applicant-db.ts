import { Applicant, Prisma } from "@prisma/client"
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library.js"
import { throwError } from "discord-bot-shared"
import prisma from "../db.js"

type ApplicantWithSettings = Prisma.ApplicantGetPayload<{ include: { guildSettings: true } }>

async function getApplicantOrThrow(username: string, guildId: string) {
  try {
    return await prisma.applicant.findUniqueOrThrow({
      where: {
        username,
        guildId,
      },
      include: {
        guildSettings: true,
      },
    })
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError && error.code === "P2025")
      throwError(`Failed to find applicant in database with username: ${username}`)
    else throw error
  }
}

async function getApplicant(username: string, guildId: string) {
  return await prisma.applicant.findUnique({
    where: {
      username,
      guildId,
    },
    include: {
      guildSettings: true,
    },
  })
}

async function saveApplicant(applicant: Applicant | ApplicantWithSettings) {
  const applicantDetails = {
    appMessageId: applicant.appMessageId,
    channelId: applicant.channelId,
    declineMessageId: applicant.declineMessageId,
    guildId: applicant.guildId,
    kick: applicant.kick,
    memberId: applicant.memberId,
    username: applicant.username,
    warcraftlogs: applicant.warcraftlogs,
  }
  await prisma.applicant.upsert({
    where: { username: applicantDetails.username, guildId: applicantDetails.guildId },
    update: applicantDetails,
    create: applicantDetails,
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

export { getApplicant, getApplicantOrThrow, removeApplicant, saveApplicant }
export type { ApplicantWithSettings }
