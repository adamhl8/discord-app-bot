import Storage from "node-persist"

export interface Applicant {
  tag: string
  name: string
  appMessageID: string
  channelID: string
  memberID?: string
  declineMessageID?: string
}

export async function getApplicant(name: string): Promise<Applicant | undefined> {
  return (await Storage.getItem(name))
}

export async function saveApplicant(applicant: Applicant): Promise<void> {
  await Storage.setItem(applicant.name, applicant)
}

export async function removeApplicant(applicant: Applicant) {
  await Storage.removeItem(applicant.name)
}