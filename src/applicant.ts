import slugify from "@sindresorhus/slugify"
import storage, { storageGet } from "./storage.js"

export interface Applicant {
  tag: string
  name: string
  appMessageId: string
  channelId: string
  memberId?: string
  declineMessageId?: string
  kick?: boolean
  warcraftlogs?: string
}

async function getApplicant(name: string, guildId: string): Promise<Applicant | undefined> {
  return await storageGet<Applicant>(`/${guildId}/applicants/${name.toLowerCase()}`)
}

async function saveApplicant(applicant: Applicant, guildId: string): Promise<void> {
  await storage.push(`/${guildId}/applicants/${applicant.name.toLowerCase()}`, applicant)
}

async function removeApplicant(applicant: Applicant, guildId: string): Promise<void> {
  await storage.delete(`/${guildId}/applicants/${applicant.name.toLowerCase()}`)
}

function parseApplicantName(tag: string): string | undefined {
  const match = /(.+)#.*?(\d+)/g.exec(tag)

  const fallbackMatch = /.+/g.exec(tag)
  if (!fallbackMatch || !fallbackMatch[0]) {
    console.error(`Unable to match Discord tag: ${tag}`)
    return
  }

  if (!match || !match[1] || !match[2]) return slugify(fallbackMatch[0].trim())

  return slugify(match[1].trim()) + match[2]
}

function appResponse(memberMention: string) {
  return (
    `${memberMention}\n\n` + "Thank you for your application. Once a decision has been made, you will be messaged/pinged with a response."
  )
}

export { getApplicant, saveApplicant, removeApplicant, parseApplicantName, appResponse }
