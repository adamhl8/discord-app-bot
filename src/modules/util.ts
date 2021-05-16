import Discord, {
	Collection,
	Snowflake,
	GuildMember,
	Message,
	TextChannel,
	Channel,
	MessageReaction
} from 'discord.js'
import Storage from 'node-persist'
import {channelCache, roleCache} from '..'
import ObjectCache from './ObjectCache'
import {Applicant, getApplicant, saveApplicant, removeApplicant} from './applicant'
import {appResponse} from './text'

// Set up global error handlers
process.on('unhandledRejection', (error) => {
	console.log('unhandledRejection:', error)
})

export async function initStorage(): Promise<void> {
	await Storage.init()

	if (!(await Storage.getItem('officerRole'))) await Storage.setItem('officerRole', 'officer')
	if (!(await Storage.getItem('applicantRole'))) await Storage.setItem('applicantRole', 'applicant')
	if (!(await Storage.getItem('appsChannel'))) await Storage.setItem('appsChannel', 'apps')
	if (!(await Storage.getItem('applicantsCategory')))
		await Storage.setItem('applicantsCategory', 'applicants')
}

export async function isMod(member: GuildMember): Promise<boolean> {
	const roles = member.roles.cache
	return roles.has(roleCache.getOrThrow(await Storage.getItem('officerRole')).id)
}

export function collectionToCacheByName<T extends {name: string}>(
	collection: Collection<Snowflake, T>
): ObjectCache<T> {
	const entries = collection.entries()
	const byName: Array<[string, T]> = Array.from(entries).map(([, item]) => {
		const key = item.name.toLowerCase()
		return [key, item]
	})

	return new ObjectCache(byName)
}

export function parseApplicantName(tag: string): string {
	const match = /(.+)#(\d+)/g.exec(tag)

	const fallbackMatch = /.+/g.exec(tag)
	if (!fallbackMatch) throw new Error(`unable to match Discord Tag: ${tag}`)

	if (!match) return fallbackMatch[0]

	const name = match[1] + match[2]
	return name
}

export async function handleApp(message: Message, guild: Discord.Guild): Promise<Applicant> {
	const fields = message.embeds[0].fields
	let tag

	for (const e of fields) {
		if (e.name == 'Discord Tag') {
			tag = e.value
			break
		}
	}

	if (!tag) throw new Error('tag is undefined')

	const name = parseApplicantName(tag)

	try {
		const channel = await guild.channels.create(name, {
			parent: channelCache.getOrThrow(await Storage.getItem('applicantsCategory')).id
		})
		await channel.send(message.embeds[0]).catch(console.error)
		return {
			tag,
			name,
			appMessageID: message.id,
			channelID: channel.id
		}
	} catch (error) {
		throw new Error(`failed to create channel for ${tag} | ${error}`)
	}
}

export async function handlePermissions(member: GuildMember): Promise<void> {
	const name = parseApplicantName(member.user.tag)

	const applicant = await getApplicant(name)
	if (!applicant) throw new Error(`applicant does not exist: ${name}`)

	applicant.memberID = member.id
	await saveApplicant(applicant)

	member.roles.add(roleCache.getOrThrow(await Storage.getItem('applicantRole')).id)

	const channel = member.guild.channels.resolve(applicant.channelID)
	if (!channel) throw new Error(`channel does not exist for applicant: ${applicant.tag}`)

	await channel.createOverwrite(member.user, {VIEW_CHANNEL: true})

	if (!isTextChannel(channel))
		throw new Error(`applicant channel is not text channel for applicant: ${applicant.tag}`)

	await channel.send(appResponse(applicant)).catch(console.error)
}

export function isTextChannel(channel: Channel): channel is TextChannel {
	return channel.type === 'text'
}

export async function handleReaction(
	reaction: MessageReaction,
	applicant: Applicant,
	channel: TextChannel
): Promise<void> {
	reaction.users.cache.each(async (user) => {
		const guildMember = reaction.message.guild?.members.resolve(user.id)
		if (!guildMember)
			throw new Error(`guild member does not exist for user: ${user.tag} | ${user.id}`)

		if (user.id == applicant.memberID || (await isMod(guildMember))) {
			await channel.delete().catch(console.error)

			if (!applicant.memberID) return
			const applicantMember = reaction.message.guild?.members.resolve(applicant.memberID)
			if (!applicantMember)
				throw new Error(`member does not exist: ${applicant.tag} | ${applicant.memberID}`)

			await applicantMember.kick().catch(console.error)

			await removeApplicant(applicant)
		}
	})
}
