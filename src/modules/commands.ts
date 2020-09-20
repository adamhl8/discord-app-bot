import { Guild, Message } from "discord.js"
import { roleCache, channelCache } from "../app-bot"
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

    if (!match) {
      await msg.channel.send("Unable to match Discord Tag.").catch(console.error)
      return
    }

    const name = match[2].toLowerCase()

    const applicant = await getApplicant(name)
    if (!applicant) {
      await msg.channel.send(`Applicant does not exist: ${name}`).catch(console.error)
      return
    }

    const channel = guild.channels.resolve(applicant.channelID)
    if (!channel) {
      await msg.channel
        .send(`Channel does not exist for applicant: ${applicant.tag}`)
        .catch(console.error)
      return
    }

    if (!isTextChannel(channel)) {
      await msg.channel.send(`Channel for applicant is not a text channel.`).catch(console.error)
      return
    }

    channel
      .send(
        `<@${applicant.memberID}>\n\n${match[3]}\n\nPlease type \`!confirm\` to acknowledge that you have read this message. Upon confirmation your application will be closed and you will be removed from the server.`
      )
      .catch(console.error)
  },
}

// applicant deny confirmation
export const confirm: Command = {
  reqMod: false,

  run: async (guild, msg) => {
    if (!isTextChannel(msg.channel)) {
      throw Error(`channel is not a text channel, got type ${msg.channel.type}`)
    }

    if (msg.channel.parent?.id != channelCache.getOrThrow("applicants").id) {
      msg.channel.send(`This channel is not an applicant channel.`)
      return
    }

    await msg.channel.delete().catch(console.error)

    const applicant = await getApplicant(msg.channel.name)
    if (!applicant || !applicant.memberID) {
      throw Error(`applicant does not exist: ${msg.channel.name}`)
    }

    const member = guild.members.resolve(applicant.memberID)
    if (!member) {
      throw Error(`member does not exist: ${applicant.tag} | ${applicant.memberID}`)
    }

    await member.kick().catch(console.error)

    await removeApplicant(applicant)
  },
}

export const a: Command = {
  reqMod: true,

  run: async (guild, msg) => {
    const match = /(!a)\s(\w+)/g.exec(msg.content)

    if (!match) {
      await msg.channel.send("Unable to match Discord Tag.").catch(console.error)
      return
    }

    const name = match[2].toLowerCase()

    const applicant = await getApplicant(name)
    if (!applicant || !applicant.memberID) {
      await msg.channel.send(`Applicant does not exist: ${name}`).catch(console.error)
      return
    }

    const member = guild.members.resolve(applicant.memberID)
    if (!member) {
      throw Error(`member does not exist: ${applicant.tag} | ${applicant.memberID}`)
    }

    member.roles.remove(roleCache.getOrThrow("Applicant").id)

    const channel = guild.channels.resolve(applicant.channelID)
    if (!channel) {
      await msg.channel
        .send(`Channel does not exist for applicant: ${applicant.tag}`)
        .catch(console.error)
      return
    }

    await channel.delete().catch(console.error)

    await removeApplicant(applicant)
  },
}
