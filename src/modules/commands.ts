import {Guild, Message} from 'discord.js'
import Storage from 'node-persist'
import {cache} from '../index.js'
import {getApplicant, saveApplicant, removeApplicant} from './applicant.js'
import {isTextChannel} from './util.js'
import {initText, appResponse} from './text.js'

export interface Command {
	reqMod: boolean
	run: (guild: Guild, message: Message) => void
}

export const init: Command = {
	reqMod: false,

	run: async (guild, message) => {
		if (!message.member?.hasPermission('ADMINISTRATOR')) {
			await message.channel.send('You must have Administrator permissions to run this command.')
			return
		}

		const officerRole = (await Storage.getItem('officerRole')) as string
		const applicantRole = (await Storage.getItem('applicantRole')) as string
		const appsChannel = (await Storage.getItem('appsChannel')) as string
		const applicantsCategory = (await Storage.getItem('applicantsCategory')) as string

		await message.channel
			.send(initText(officerRole, applicantRole, appsChannel, applicantsCategory))
			.catch(console.error)
	}
}

export const officerRole: Command = {
	reqMod: false,

	run: async (guild, message) => {
		if (!message.member?.hasPermission('ADMINISTRATOR')) {
			await message.channel.send('You must have Administrator permissions to run this command.')
			return
		}

		const match = /(!officerRole)\s(.+)/g.exec(message.content)
		if (!match) {
			await message.channel.send('Invalid !officerRole command.').catch(console.error)
			return
		}

		await Storage.updateItem('officerRole', match[2])
		await message.channel.send(`officerRole has been set to: \`${match[2]}\``).catch(console.error)
	}
}

export const applicantRole: Command = {
	reqMod: false,

	run: async (guild, message) => {
		if (!message.member?.hasPermission('ADMINISTRATOR')) {
			await message.channel.send('You must have Administrator permissions to run this command.')
			return
		}

		const match = /(!applicantRole)\s(.+)/g.exec(message.content)
		if (!match) {
			await message.channel.send('Invalid !applicantRole command.').catch(console.error)
			return
		}

		await Storage.updateItem('applicantRole', match[2])
		await message.channel
			.send(`applicantRole has been set to: \`${match[2]}\``)
			.catch(console.error)
	}
}

export const appsChannel: Command = {
	reqMod: false,

	run: async (guild, message) => {
		if (!message.member?.hasPermission('ADMINISTRATOR')) {
			await message.channel.send('You must have Administrator permissions to run this command.')
			return
		}

		const match = /(!appsChannel)\s(.+)/g.exec(message.content)
		if (!match) {
			await message.channel.send('Invalid !appsChannel command.').catch(console.error)
			return
		}

		await Storage.updateItem('appsChannel', match[2])
		await message.channel.send(`appsChannel has been set to: \`${match[2]}\``).catch(console.error)
	}
}

export const applicantsCategory: Command = {
	reqMod: false,

	run: async (guild, message) => {
		if (!message.member?.hasPermission('ADMINISTRATOR')) {
			await message.channel.send('You must have Administrator permissions to run this command.')
			return
		}

		const match = /(!applicantsCategory)\s(.+)/g.exec(message.content)
		if (!match) {
			await message.channel.send('Invalid !applicantsCategory command.').catch(console.error)
			return
		}

		await Storage.updateItem('applicantsCategory', match[2])
		await message.channel
			.send(`applicantsCategory has been set to: \`${match[2]}\``)
			.catch(console.error)
	}
}

export const d: Command = {
	reqMod: true,

	run: async (guild, message) => {
		const match = /(!d)\s(.+?)\s(.+)/g.exec(message.content)
		if (!match) {
			await message.channel
				.send('Invalid !d command. (e.g. !d user1234 reason)')
				.catch(console.error)
			return
		}

		const name = match[2]

		const applicant = await getApplicant(name)
		if (!applicant) {
			await message.channel.send(`Applicant does not exist: ${name}`).catch(console.error)
			return
		}

		if (!applicant.memberID) {
			await message.channel
				.send(`Applicant is not in the server or hasn't been linked: ${name}`)
				.catch(console.error)
			return
		}

		const channel = guild.channels.resolve(applicant.channelID)
		if (!channel) {
			await message.channel
				.send(`Channel does not exist for applicant: ${name}`)
				.catch(console.error)
			return
		}

		if (!isTextChannel(channel)) {
			await message.channel
				.send(`Channel for applicant is not a text channel.`)
				.catch(console.error)
			return
		}

		const declineMessage = await channel
			.send(
				`<@${applicant.memberID}>\n\n${match[3]}\n\nPlease click the 👍 reaction on this message to confirm that you have read this message. Upon confirmation your application will be closed and you will be removed from the server.`
			)
			.catch(console.error)
		if (!declineMessage) throw new Error(`unable to send decline message for: ${name}`)

		await declineMessage.react('👍').catch(console.error)

		applicant.declineMessageID = declineMessage.id
		await saveApplicant(applicant)

		const appsChannelName = (await Storage.getItem('appsChannel')) as string
		const appsChannel = guild.channels.resolve(cache.channels.getOrThrow(appsChannelName).id)
		if (!appsChannel) throw new Error(`channel does not exist`)
		if (!isTextChannel(appsChannel))
			throw new Error(`apps channel is not a text channel | ${appsChannel?.id}`)

		const appMessage = appsChannel.messages.resolve(applicant.appMessageID)

		await appMessage?.react(cache.emojis.getOrThrow('declined').id).catch(console.error)
	}
}

export const a: Command = {
	reqMod: true,

	run: async (guild, message) => {
		const match = /(!a)\s(.+)/g.exec(message.content)

		if (!match) {
			await message.channel.send('Invalid !a command. (e.g. !a user1234)').catch(console.error)
			return
		}

		const name = match[2]

		const applicant = await getApplicant(name)
		if (!applicant) {
			await message.channel.send(`Applicant does not exist: ${name}`).catch(console.error)
			return
		}

		if (!applicant.memberID) {
			await message.channel
				.send(`Applicant is not in the server or hasn't been linked: ${name}`)
				.catch(console.error)
			return
		}

		const member = guild.members.resolve(applicant.memberID)
		if (!member) throw new Error(`member does not exist: ${applicant.tag} | ${applicant.memberID}`)

		const applicantRole = (await Storage.getItem('applicantRole')) as string
		await member.roles.remove(cache.roles.getOrThrow(applicantRole).id)

		const channel = guild.channels.resolve(applicant.channelID)
		if (!channel) {
			await message.channel
				.send(`Channel does not exist for applicant: ${applicant.name}`)
				.catch(console.error)
			return
		}

		await channel.delete().catch(console.error)

		const appsChannelName = (await Storage.getItem('appsChannel')) as string
		const appsChannel = guild.channels.resolve(cache.channels.getOrThrow(appsChannelName).id)
		if (!appsChannel) throw new Error(`apps channel does not exist`)
		if (!isTextChannel(appsChannel))
			throw new Error(`apps channel is not a text channel, got type ${message.channel.type}`)

		const appMessage = appsChannel.messages.resolve(applicant.appMessageID)

		appMessage?.react(cache.emojis.getOrThrow('approved').id)

		await removeApplicant(applicant)
	}
}

export const l: Command = {
	reqMod: true,

	run: async (guild, message) => {
		const match = /(!l)\s(.+?)\s.*?(\d+)/g.exec(message.content)

		if (!match) {
			await message.channel
				.send('Invalid !l command. (e.g !l channelName1234 @userTag#1234)')
				.catch(console.error)
			return
		}

		const name = match[2]
		const userID = match[3]

		const applicant = await getApplicant(name)
		if (!applicant) {
			await message.channel.send(`Applicant does not exist: ${name}`).catch(console.error)
			return
		}

		const member = guild.members.resolve(userID)
		if (!member) {
			await message.channel.send(`Member does not exist.`).catch(console.error)
			return
		}

		applicant.memberID = member.id
		applicant.tag = member.user.tag
		await saveApplicant(applicant)

		const applicantRole = (await Storage.getItem('applicantRole')) as string
		await member.roles.add(cache.roles.getOrThrow(applicantRole).id)

		const channel = member.guild.channels.resolve(applicant.channelID)
		if (!channel) throw new Error(`channel does not exist for applicant: ${applicant.tag}`)

		await channel.createOverwrite(member.user, {VIEW_CHANNEL: true})

		if (!isTextChannel(channel))
			throw new Error(`applicant channel is not text channel for applicant: ${applicant.tag}`)

		await channel.send(appResponse(applicant)).catch(console.error)
	}
}
