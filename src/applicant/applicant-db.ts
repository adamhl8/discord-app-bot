import prisma from "../storage.js"

export interface Applicant {
  username: string
  appMessageId: string
  channelId: string
  memberId: string | null
  declineMessageId: string | null
  kick: boolean | null
  warcraftlogs: string | null
}

async function getApplicant(username: string, guildId: string) {
  return prisma.applicant.findUniqueOrThrow({
    where: {
      username,
      guildId,
    },
  })
}

async function saveApplicant(applicant: Applicant, guildId: string) {
  await prisma.applicant.create({
    data: {
      ...applicant,
      guildId,
    },
  })
}

async function removeApplicant(applicant: Applicant, guildId: string) {
  await prisma.applicant.delete({
    where: {
      username: applicant.username,
      guildId,
    },
  })
}

function appResponse(memberMention: string) {
  return (
    `${memberMention}\n\n` +
    "Thank you for your application. Once a decision has been made, you will be messaged/pinged with a response."
  )
}

export { appResponse, getApplicant, removeApplicant, saveApplicant }
