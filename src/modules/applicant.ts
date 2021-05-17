import Storage from 'node-persist'

export interface Applicant {
	tag: string
	name: string
	appMessageID: string
	channelID: string
	memberID?: string
	declineMessageID?: string
}

export async function getApplicant(name: string): Promise<Applicant | undefined> {
	return (await Storage.getItem(name.toLowerCase())) as Applicant
}

export async function saveApplicant(applicant: Applicant): Promise<void> {
	await Storage.setItem(applicant.name.toLowerCase(), applicant)
}

export async function removeApplicant(applicant: Applicant): Promise<void> {
	await Storage.removeItem(applicant.name.toLowerCase())
}
