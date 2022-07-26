import slugify from '@sindresorhus/slugify'
import storage, { storageGet } from './storage.js'

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

function getApplicant(name: string): Applicant | undefined {
  return storageGet<Applicant>(`/applicants/${name.toLowerCase()}`)
}

function saveApplicant(applicant: Applicant): void {
  storage.push(`/applicants/${applicant.name.toLowerCase()}`, applicant)
}

function removeApplicant(applicant: Applicant): void {
  storage.delete(`/applicants/${applicant.name.toLowerCase()}`)
}

function parseApplicantName(tag: string): string | undefined {
  const match = /(.+)#.*?(\d+)/g.exec(tag)

  const fallbackMatch = /.+/g.exec(tag)
  if (!fallbackMatch) {
    console.error(`Unable to match Discord tag: ${tag}`)
    return undefined
  }

  if (!match) return slugify(fallbackMatch[0].trim())

  return slugify(match[1].trim()) + match[2]
}

function appResponse(memberMention: string) {
  return (
    `${memberMention}\n\n` +
    'Thank you for your application. Once a decision has been made, you will be messaged/pinged with a response.'
  )
}

export { getApplicant, saveApplicant, removeApplicant, parseApplicantName, appResponse }
