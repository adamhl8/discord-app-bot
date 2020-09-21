import { Guild, Message } from "discord.js"
import { roleCache, channelCache, emojiCache } from "../app-bot"
import { getApplicant, removeApplicant } from "./Applicant"
import { isTextChannel } from "./util"

export interface Command {
  reqMod: boolean
  run: (guild: Guild, msg: Message) => void
}

export const d: Command = {
  reqMod: true,

  run: async (guild, msg) => {

    const match = /(!d)\s(\w+)\s(.+)/g.exec(msg.content)
    if (!match) return await msg.channel.send("Invalid !d command. (e.g. !d user#1234 reason)").catch(console.error)

    const name = match[2].toLowerCase()

    const applicant = await getApplicant(name)
    if (!applicant) return await msg.channel.send(`Applicant does not exist: ${name}`).catch(console.error)

    const channel = guild.channels.resolve(applicant.channelID)
    if (!channel) return await msg.channel.send(`Channel does not exist for applicant: ${applicant.tag}`).catch(console.error)
    if (!isTextChannel(channel)) return await msg.channel.send(`Channel for applicant is not a text channel.`).catch(console.error)

    channel
      .send(
        `<@${applicant.memberID}>\n\n${match[3]}\n\nPlease click the 👍 reaction on this message to confirm that you have read this message. Upon confirmation your application will be closed and you will be removed from the server.`
      )
      .catch(console.error)

    const appsChannel = guild.channels.resolve(channelCache.getOrThrow("apps").id)
    if (!appsChannel) throw Error(`channel does not exist`)
    if (!isTextChannel(appsChannel)) throw Error(`apps channel is not a text channel | ${appsChannel?.id}`)

    const appMessage = appsChannel.messages.resolve(applicant.appMessageID)

    appMessage?.react(emojiCache.getOrThrow("declined").id).catch(console.error)
  },
}

// applicant deny confirmation
export const confirm: Command = {
  reqMod: false,

  run: async (guild, msg) => {

    if (!isTextChannel(msg.channel)) throw Error(`channel is not a text channel, got type ${msg.channel.type}`)

    if (msg.channel.parent?.id != channelCache.getOrThrow("applicants").id) return msg.channel.send(`This channel is not an applicant channel.`).catch(console.error)

    await msg.channel.delete().catch(console.error)

    const applicant = await getApplicant(msg.channel.name)
    if (!applicant || !applicant.memberID) throw Error(`applicant does not exist: ${msg.channel.name}`)

    const member = guild.members.resolve(applicant.memberID)
    if (!member) throw Error(`member does not exist: ${applicant.tag} | ${applicant.memberID}`)

    await member.kick().catch(console.error)

    await removeApplicant(applicant)
  },
}

export const a: Command = {
  reqMod: true,

  run: async (guild, msg) => {

    const match = /(!a)\s(\w+)/g.exec(msg.content)

    if (!match) return await msg.channel.send("Invalid !a command. (e.g !a user#1234)").catch(console.error)

    const name = match[2].toLowerCase()

    const applicant = await getApplicant(name)
    if (!applicant || !applicant.memberID) return await msg.channel.send(`Applicant does not exist: ${name}`).catch(console.error)

    const member = guild.members.resolve(applicant.memberID)
    if (!member) throw Error(`member does not exist: ${applicant.tag} | ${applicant.memberID}`)

    member.roles.remove(roleCache.getOrThrow("Applicant").id)

    const channel = guild.channels.resolve(applicant.channelID)
    if (!channel) return await msg.channel.send(`Channel does not exist for applicant: ${applicant.tag}`).catch(console.error)

    await channel.delete().catch(console.error)

    const appsChannel = guild.channels.resolve(channelCache.getOrThrow("apps").id)
    if (!appsChannel) throw Error(`channel does not exist`)
    if (!isTextChannel(appsChannel)) throw Error(`apps channel is not a Text Channel | ${appsChannel?.id}`)

    const appMessage = appsChannel.messages.resolve(applicant.appMessageID)

    appMessage?.react(emojiCache.getOrThrow("approved").id)

    await removeApplicant(applicant)
  },
}

export const oc: Command = {
  reqMod: false,

  run: async (guild, msg) => {
    msg.channel.send("https://cdn.discordapp.com/attachments/421529280355237891/757685187281944636/overlmao.png").catch(console.error)
  }
}
