require("dotenv").config({ path: process.argv[2] })

import Discord, {
  Message,
  Role,
  GuildMember,
  PartialGuildMember,
  GuildChannel,
  TextChannel,
} from "discord.js"
import * as Util from "./modules/util"
import * as Commands from "./modules/commands"
import { Command } from "./modules/commands"
import { saveApplicant } from "./modules/Applicant"
import ObjectCache from "./modules/ObjectCache"
import Storage from "node-persist"

const bot = new Discord.Client()
bot.login(process.env.TOKEN)

let guild: Discord.Guild

bot.on("ready", async () => {
  await Storage.init()

  const g = bot.guilds.cache.first()
  if (!g) {
    throw Error("failed to init guild")
  }
  guild = g

  console.log("I am ready!")

  run()
})

export let roleCache: ObjectCache<Role> = new ObjectCache()
export let channelCache: ObjectCache<GuildChannel> = new ObjectCache()

function run() {
  roleCache = Util.collectionToCacheByName(guild.roles.cache)
  channelCache = Util.collectionToCacheByName(guild.channels.cache)

  bot.on("roleUpdate", () => (roleCache = Util.collectionToCacheByName(guild.roles.cache)))
  bot.on("roleCreate", () => (roleCache = Util.collectionToCacheByName(guild.roles.cache)))
  bot.on("roleDelete", () => (roleCache = Util.collectionToCacheByName(guild.roles.cache)))

  bot.on("channelUpdate", () => (channelCache = Util.collectionToCacheByName(guild.channels.cache)))
  bot.on("channelCreate", () => (channelCache = Util.collectionToCacheByName(guild.channels.cache)))
  bot.on("channelDelete", () => (channelCache = Util.collectionToCacheByName(guild.channels.cache)))
}

function isPartial(member: GuildMember | PartialGuildMember): member is PartialGuildMember {
  return member.partial
}

bot.on("guildMemberAdd", async (member: GuildMember | PartialGuildMember) => {
  if (isPartial(member)) {
    // PartialGuildMember
    try {
      const m = await member.fetch()
      Util.handlePermissions(m)
    } catch (e) {
      console.log("failed to fecth partial member on guildMemberAdd")
    }
  } else {
    // GuildMember
    Util.handlePermissions(member)
  }
})

bot.on("message", async (msg: Message) => {
  if (msg.channel.id == channelCache.getOrThrow("apps").id) {
    const applicant = await Util.handleApp(msg, guild)
    await saveApplicant(applicant)
  }

  if (msg.author.bot) return

  const prefix = "!"

  if (!msg.content.startsWith(prefix)) return

  let match = /!(\S+)/g.exec(msg.content)
  let command = "none"
  if (match) {
    command = match[1]
  }

  if (!msg.member) {
    throw Error(`there is no member attached to message ${msg.id}`)
  }

  const commands: Record<string, Command> = Commands

  if (commands.hasOwnProperty(command)) {
    if (commands[command].reqMod && !Util.isMod(msg.member, roleCache)) {
      msg.channel
        .send("You do not have the required moderator role to run this command.")
        .catch(console.log)
    } else {
      commands[command].run(guild, msg)
    }
  }
})