require("dotenv").config({ path: process.argv[2] })

import Discord, { Message, Role, GuildMember, PartialGuildMember, GuildChannel } from "discord.js"
import * as Util from "./modules/util"
import * as Commands from "./modules/commands"
import { Command } from "./modules/commands"
import ObjectCache from "./modules/ObjectCache"

const bot = new Discord.Client()
bot.login(process.env.TOKEN)

bot.on("ready", () => {
  console.log("I am ready!")

  run()
})

let roleCache: ObjectCache<Role> = new ObjectCache()
let channelCache: ObjectCache<GuildChannel> = new ObjectCache()

function run() {
  const guild = bot.guilds.cache.first()
  if (!guild) {
    throw Error("failed to init guild")
  }

  roleCache = Util.collectionToCacheByName(guild.roles.cache)
  channelCache = Util.collectionToCacheByName(guild.channels.cache)
  bot.on("roleUpdate", () => (roleCache = Util.collectionToCacheByName(guild.roles.cache)))
  bot.on("roleCreate", () => (roleCache = Util.collectionToCacheByName(guild.roles.cache)))
  bot.on("roleDelete", () => (roleCache = Util.collectionToCacheByName(guild.roles.cache)))
}

bot.on("guildMemberAdd", async (member: GuildMember | PartialGuildMember) => {
  if (isPartial(member)) {
    // PartialGuildMember
    try {
      const m = await member.fetch()
      Util.welcomeNewMember(m)
    } catch (e) {
      console.log("failed to fecth partial member on guildMemberAdd")
    }
  } else {
    // GuildMember
    Util.welcomeNewMember(member)
  }

  member.roles.add(roleCache.getOrThrow("Valarjar").id).catch(console.log)
})

function isPartial(member: GuildMember | PartialGuildMember): member is PartialGuildMember {
  return member.partial
}

bot.on("message", (msg: Message) => {
  if (msg.channel.id == channelCache.getOrThrow("apps").id) {
    console.log(msg.content)
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
      commands[command].run(msg)
    }
  }
})
