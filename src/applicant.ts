import slugify from '@sindresorhus/slugify'
import storage from './storage.js'

export interface Applicant {
  tag: string
  name: string
  appMessageId: string
  channelId: string
  memberId?: string
  declineMessageId?: string
}

function getApplicant(name: string): Applicant | undefined {
  return storage.get<Applicant>(`/applicants/${name.toLowerCase()}`)
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
    console.error(`unable to match Discord Tag: ${tag}`)
    return undefined
  }

  if (!match) return slugify(fallbackMatch[0].trim())

  return slugify(match[1].trim()) + match[2]
}

export { getApplicant, saveApplicant, removeApplicant, parseApplicantName }
