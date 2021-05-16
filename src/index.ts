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
import * as Util from './modules/util'
import * as Commands from './modules/commands'
import {Command} from './modules/commands'
import {getApplicant, saveApplicant} from './modules/applicant'
import ObjectCache from './modules/ObjectCache'

dotenv.config({path: process.argv[2]})

const bot = new Discord.Client()
bot.login(process.env.TOKEN)

let guild: Discord.Guild

bot.on('ready', async () => {
	Util.initStorage()

	const g = bot.guilds.cache.first()
	if (!g) {
		throw new Error('failed to init guild')
	}

	guild = g

	console.log('I am ready!')

	run()
})

export let roleCache: ObjectCache<Role> = new ObjectCache()
export let channelCache: ObjectCache<GuildChannel> = new ObjectCache()
export let emojiCache: ObjectCache<GuildEmoji> = new ObjectCache()

function run() {
	roleCache = Util.collectionToCacheByName(guild.roles.cache)
	channelCache = Util.collectionToCacheByName(guild.channels.cache)
	emojiCache = Util.collectionToCacheByName(guild.emojis.cache)

	bot.on('roleUpdate', () => (roleCache = Util.collectionToCacheByName(guild.roles.cache)))
	bot.on('roleCreate', () => (roleCache = Util.collectionToCacheByName(guild.roles.cache)))
	bot.on('roleDelete', () => (roleCache = Util.collectionToCacheByName(guild.roles.cache)))

	bot.on('channelUpdate', () => (channelCache = Util.collectionToCacheByName(guild.channels.cache)))
	bot.on('channelCreate', () => (channelCache = Util.collectionToCacheByName(guild.channels.cache)))
	bot.on('channelDelete', () => (channelCache = Util.collectionToCacheByName(guild.channels.cache)))

	bot.on('emojiUpdate', () => (emojiCache = Util.collectionToCacheByName(guild.emojis.cache)))
	bot.on('emojiCreate', () => (emojiCache = Util.collectionToCacheByName(guild.emojis.cache)))
	bot.on('emojiDelete', () => (emojiCache = Util.collectionToCacheByName(guild.emojis.cache)))
}

function isPartial(member: GuildMember | PartialGuildMember): member is PartialGuildMember {
	return member.partial
}

bot.on('guildMemberAdd', async (member: GuildMember | PartialGuildMember) => {
	if (isPartial(member)) {
		// PartialGuildMember
		try {
			const m = await member.fetch()
			Util.handlePermissions(m)
		} catch {
			console.log('failed to fecth partial member on guildMemberAdd')
		}
	} else {
		// GuildMember
		Util.handlePermissions(member)
	}
})

bot.on('message', async (message: Message) => {
	if (message.channel.id == channelCache.getOrThrow(await Storage.getItem('appsChannel')).id) {
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

	const commands: Record<string, Command> = Commands

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

	if (reaction.message.id == applicant.declineMessageID)
		Util.handleReaction(reaction, applicant, reactionChannel)
})
