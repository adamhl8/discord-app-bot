import dotenv from 'dotenv'
import Discord, {
	Message,
	Role,
	GuildMember,
	PartialGuildMember,
	GuildChannel,
	GuildEmoji,
	MessageReaction
} from 'discord.js'
import Storage from 'node-persist'
import * as Util from './modules/util.js'
import * as Commands from './modules/commands.js'
import {getApplicant, saveApplicant} from './modules/applicant.js'
import ObjectCache from './modules/object-cache.js'

dotenv.config({path: process.argv[2]})

const bot = new Discord.Client()
await bot.login(process.env.TOKEN)

let guild: Discord.Guild

bot.on('ready', async () => {
	await Util.initStorage()

	const g = bot.guilds.cache.first()
	if (!g) {
		throw new Error('failed to init guild')
	}

	guild = g

	console.log('I am ready!')

	run()
})

export const cache = {
	roles: new ObjectCache<Role>(),
	channels: new ObjectCache<GuildChannel>(),
	emojis: new ObjectCache<GuildEmoji>()
}

function run() {
	cache.roles = Util.collectionToCacheByName(guild.roles.cache)
	cache.channels = Util.collectionToCacheByName(guild.channels.cache)
	cache.emojis = Util.collectionToCacheByName(guild.emojis.cache)

	bot.on('roleUpdate', () => {
		cache.roles = Util.collectionToCacheByName(guild.roles.cache)
	})
	bot.on('roleCreate', () => {
		cache.roles = Util.collectionToCacheByName(guild.roles.cache)
	})
	bot.on('roleDelete', () => {
		cache.roles = Util.collectionToCacheByName(guild.roles.cache)
	})

	bot.on('channelUpdate', () => {
		cache.channels = Util.collectionToCacheByName(guild.channels.cache)
	})
	bot.on('channelCreate', () => {
		cache.channels = Util.collectionToCacheByName(guild.channels.cache)
	})
	bot.on('channelDelete', () => {
		cache.channels = Util.collectionToCacheByName(guild.channels.cache)
	})

	bot.on('emojiUpdate', () => {
		cache.emojis = Util.collectionToCacheByName(guild.emojis.cache)
	})
	bot.on('emojiCreate', () => {
		cache.emojis = Util.collectionToCacheByName(guild.emojis.cache)
	})
	bot.on('emojiDelete', () => {
		cache.emojis = Util.collectionToCacheByName(guild.emojis.cache)
	})
}

function isPartial(member: GuildMember | PartialGuildMember): member is PartialGuildMember {
	return member.partial
}

bot.on('guildMemberAdd', async (member: GuildMember | PartialGuildMember) => {
	if (isPartial(member)) {
		// PartialGuildMember
		try {
			const m = await member.fetch()
			await Util.handlePermissions(m)
		} catch {
			console.log('failed to fecth partial member on guildMemberAdd')
		}
	} else {
		// GuildMember
		await Util.handlePermissions(member)
	}
})

bot.on('message', async (message: Message) => {
	const appsChannel = (await Storage.getItem('appsChannel')) as string
	if (message.channel.id === cache.channels.getOrThrow(appsChannel).id) {
		const applicant = await Util.handleApp(message, guild)
		await saveApplicant(applicant)
	}

	if (message.author.bot) return

	const prefix = '!'

	if (!message.content.startsWith(prefix)) return

	const match = /!(\S+)/g.exec(message.content)
	let command = 'none'
	if (match) {
		command = match[1]
	}

	if (!message.member) {
		throw new Error(`there is no member attached to message ${message.id}`)
	}

	const commands: Record<string, Commands.Command> = Commands

	if (Object.prototype.hasOwnProperty.call(commands, command)) {
		if (commands[command].reqMod && !(await Util.isMod(message.member))) {
			message.channel
				.send('You do not have the required moderator role to run this command.')
				.catch(console.log)
		} else {
			commands[command].run(guild, message)
		}
	}
})

bot.on('messageReactionAdd', async (reaction: MessageReaction) => {
	const reactionChannel = reaction.message.channel
	if (!Util.isTextChannel(reactionChannel)) return

	const applicant = await getApplicant(reactionChannel.name)
	if (!applicant) return

	if (reaction.message.id === applicant.declineMessageID)
		await Util.handleReaction(reaction, applicant, reactionChannel)
})
