import storage from "./storage.js"

export interface Applicant {
  username: string
  appMessageId: string
  channelId: string
  memberId?: string
  declineMessageId?: string
  kick?: boolean
  warcraftlogs?: string
}

async function getApplicant(username: string, guildId: string) {
  return await storage.getObject<Applicant>(`/${guildId}/applicants/${username.toLowerCase()}`)
}

async function saveApplicant(applicant: Applicant, guildId: string) {
  await storage.push(`/${guildId}/applicants/${applicant.username.toLowerCase()}`, applicant)
}

async function removeApplicant(applicant: Applicant, guildId: string) {
  await storage.delete(`/${guildId}/applicants/${applicant.username.toLowerCase()}`)
}

function appResponse(memberMention: string) {
  return (
    `${memberMention}\n\n` +
    "Thank you for your application. Once a decision has been made, you will be messaged/pinged with a response."
  )
}

export { appResponse, getApplicant, removeApplicant, saveApplicant }
