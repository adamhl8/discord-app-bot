import {
  Client,
  GuildChannel,
  GuildEmoji,
  GuildMember,
  Intents,
  Message,
  MessageReaction,
  PartialGuildMember,
  Role,
} from 'discord.js'
import { getApplicant, saveApplicant } from './modules/applicant.js'
import * as Commands from './modules/commands.js'
import ObjectCache from './modules/object-cache.js'
import * as Util from './modules/util.js'

const botIntents = {
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_MESSAGE_REACTIONS],
}

const bot = new Client(botIntents)
void bot.login(process.env.BOT_TOKEN)

// let guild: Discord.Guild

bot.once('ready', () => {
  // void Util.initStorage()

  /*
  const g = bot.guilds.cache.first()
  if (!g) {
    throw new Error('failed to init guild')
  }

  guild = g

  

  run()
  */

  console.log('I am ready!')
})

export const cache = {
  roles: new ObjectCache<Role>(),
  channels: new ObjectCache<GuildChannel>(),
  emojis: new ObjectCache<GuildEmoji>(),
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

async function handleMemberAdd(member: GuildMember | PartialGuildMember) {
  if (isPartial(member)) {
    // PartialGuildMember
    try {
      const m = await member.fetch()
      await Util.handlePermissions(m)
    } catch {
      console.log('failed to fetch partial member on guildMemberAdd')
    }
  } else {
    // GuildMember
    await Util.handlePermissions(member)
  }
}

bot.on('guildMemberAdd', (member: GuildMember | PartialGuildMember) => {
  void handleMemberAdd(member)
})

async function handleMessage(message: Message) {
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
    const memberPermissions = await Util.memberPermissions(message.member)

    if (commands[command].reqAdmin && !memberPermissions.isAdmin) {
      message.channel.send('You must have Administrator permissions to run this command.').catch(console.error)
    } else if (commands[command].reqMod && !memberPermissions.isMod && !memberPermissions.isAdmin) {
      message.channel.send('You do not have the required moderator role to run this command.').catch(console.error)
    } else {
      commands[command].run(guild, message)
    }
  }
}

bot.on('message', (message: Message) => {
  void handleMessage(message)
})

async function handleMessageReaction(reaction: MessageReaction) {
  const reactionChannel = reaction.message.channel
  if (!Util.isTextChannel(reactionChannel)) return

  const applicant = await getApplicant(reactionChannel.name)
  if (!applicant) return

  if (reaction.message.id === applicant.declineMessageID) Util.handleReaction(reaction, applicant, reactionChannel)
}

bot.on('messageReactionAdd', (reaction: MessageReaction) => {
  void handleMessageReaction(reaction)
})
