import { Guild, Message } from "discord.js"
import { roleCache, channelCache, emojiCache } from ".."
import { getApplicant, saveApplicant, removeApplicant } from "./Applicant"
import { isTextChannel } from "./util"
import { initText } from "./text"
import Storage from "node-persist"
import { appResponse } from "./text"

export interface Command {
  reqMod: boolean
  run: (guild: Guild, msg: Message) => void
}

export const init: Command = {
  reqMod: false,

  run: async (guild, msg) => {
    if (!msg.member?.hasPermission("ADMINISTRATOR"))
      return await msg.channel.send("You must have Administrator permissions to run this command.")

    const officerRole = await Storage.getItem("officerRole")
    const applicantRole = await Storage.getItem("applicantRole")
    const appsChannel = await Storage.getItem("appsChannel")
    const applicantsCategory = await Storage.getItem("applicantsCategory")

    await msg.channel
      .send(initText(officerRole, applicantRole, appsChannel, applicantsCategory))
      .catch(console.error)
  },
}

export const officerRole: Command = {
  reqMod: false,

  run: async (guild, msg) => {
    if (!msg.member?.hasPermission("ADMINISTRATOR"))
      return await msg.channel.send("You must have Administrator permissions to run this command.")
    const match = /(!officerRole)\s(.+)/g.exec(msg.content)
    if (!match) return await msg.channel.send("Invalid !officerRole command.").catch(console.error)
    await Storage.updateItem("officerRole", match[2])
    await msg.channel.send(`officerRole has been set to: \`${match[2]}\``).catch(console.error)
  },
}

export const applicantRole: Command = {
  reqMod: false,

  run: async (guild, msg) => {
    if (!msg.member?.hasPermission("ADMINISTRATOR"))
      return await msg.channel.send("You must have Administrator permissions to run this command.")
    const match = /(!applicantRole)\s(.+)/g.exec(msg.content)
    if (!match)
      return await msg.channel.send("Invalid !applicantRole command.").catch(console.error)
    await Storage.updateItem("applicantRole", match[2])
    await msg.channel.send(`applicantRole has been set to: \`${match[2]}\``).catch(console.error)
  },
}

export const appsChannel: Command = {
  reqMod: false,

  run: async (guild, msg) => {
    if (!msg.member?.hasPermission("ADMINISTRATOR"))
      return await msg.channel.send("You must have Administrator permissions to run this command.")
    const match = /(!appsChannel)\s(.+)/g.exec(msg.content)
    if (!match) return await msg.channel.send("Invalid !appsChannel command.").catch(console.error)
    await Storage.updateItem("appsChannel", match[2])
    await msg.channel.send(`appsChannel has been set to: \`${match[2]}\``).catch(console.error)
  },
}

export const applicantsCategory: Command = {
  reqMod: false,

  run: async (guild, msg) => {
    if (!msg.member?.hasPermission("ADMINISTRATOR"))
      return await msg.channel.send("You must have Administrator permissions to run this command.")
    const match = /(!applicantsCategory)\s(.+)/g.exec(msg.content)
    if (!match)
      return await msg.channel.send("Invalid !applicantsCategory command.").catch(console.error)
    await Storage.updateItem("applicantsCategory", match[2])
    await msg.channel
      .send(`applicantsCategory has been set to: \`${match[2]}\``)
      .catch(console.error)
  },
}

export const d: Command = {
  reqMod: true,

  run: async (guild, msg) => {
    const match = /(!d)\s(.+)\s(.+)/g.exec(msg.content)
    if (!match)
      return await msg.channel
        .send("Invalid !d command. (e.g. !d user1234 reason)")
        .catch(console.error)

    const name = match[2].toLowerCase()

    const applicant = await getApplicant(name)
    if (!applicant)
      return await msg.channel.send(`Applicant does not exist: ${name}`).catch(console.error)

    if (!applicant.memberID)
      return await msg.channel.send(`Applicant is not in the server or hasn't been linked: ${name}`).catch(console.error)

    const channel = guild.channels.resolve(applicant.channelID)
    if (!channel)
      return await msg.channel
        .send(`Channel does not exist for applicant: ${name}`)
        .catch(console.error)
    if (!isTextChannel(channel))
      return await msg.channel
        .send(`Channel for applicant is not a text channel.`)
        .catch(console.error)

    const declineMessage = await channel
      .send(
        `<@${applicant.memberID}>\n\n${match[3]}\n\nPlease click the 👍 reaction on this message to confirm that you have read this message. Upon confirmation your application will be closed and you will be removed from the server.`
      )
      .catch(console.error)
    if (!declineMessage) throw Error(`unable to send decline message for: ${name}`)

    await declineMessage.react("👍").catch(console.error)

    applicant.declineMessageID = declineMessage.id
    await saveApplicant(applicant)

    const appsChannel = guild.channels.resolve(
      channelCache.getOrThrow(await Storage.getItem("appsChannel")).id
    )
    if (!appsChannel) throw Error(`channel does not exist`)
    if (!isTextChannel(appsChannel))
      throw Error(`apps channel is not a text channel | ${appsChannel?.id}`)

    const appMessage = appsChannel.messages.resolve(applicant.appMessageID)

    await appMessage?.react(emojiCache.getOrThrow("declined").id).catch(console.error)
  },
}

export const a: Command = {
  reqMod: true,

  run: async (guild, msg) => {
    const match = /(!a)\s(.+)/g.exec(msg.content)

    if (!match)
      return await msg.channel.send("Invalid !a command. (e.g !a user1234)").catch(console.error)

    const name = match[2].toLowerCase()

    const applicant = await getApplicant(name)
    if (!applicant)
      return await msg.channel.send(`Applicant does not exist: ${name}`).catch(console.error)

    if (!applicant.memberID)
      return await msg.channel.send(`Applicant is not in the server or hasn't been linked: ${name}`).catch(console.error)

    const member = guild.members.resolve(applicant.memberID)
    if (!member) throw Error(`member does not exist: ${applicant.tag} | ${applicant.memberID}`)

    await member.roles.remove(roleCache.getOrThrow(await Storage.getItem("applicantRole")).id)

    const channel = guild.channels.resolve(applicant.channelID)
    if (!channel)
      return await msg.channel
        .send(`Channel does not exist for applicant: ${applicant.name}`)
        .catch(console.error)

    await channel.delete().catch(console.error)

    const appsChannel = guild.channels.resolve(
      channelCache.getOrThrow(await Storage.getItem("appsChannel")).id
    )
    if (!appsChannel) throw Error(`apps channel does not exist`)
    if (!isTextChannel(appsChannel))
      throw Error(`apps channel is not a text channel, got type ${msg.channel.type}`)

    const appMessage = appsChannel.messages.resolve(applicant.appMessageID)

    appMessage?.react(emojiCache.getOrThrow("approved").id)

    await removeApplicant(applicant)
  },
}

export const l: Command = {
  reqMod: true,

  run: async (guild, msg) => {
    const match = /(!l)\s(.+)\s<@!(\d+)/g.exec(msg.content)

    if (!match)
      return await msg.channel.send("Invalid !l command. (e.g !m channelName#1234 @userTag#1234)").catch(console.error)

    const name = match[2].toLowerCase()
    const userID = match[3]

    const applicant = await getApplicant(name)
    if (!applicant)
      return await msg.channel.send(`Applicant does not exist: ${name}`).catch(console.error)

    const member = guild.members.resolve(userID)
    if (!member)
      return await msg.channel.send(`Member does not exist.`).catch(console.error)

    applicant.memberID = member.id
    applicant.tag = member.user.tag
    await saveApplicant(applicant)

    member.roles.add(roleCache.getOrThrow(await Storage.getItem("applicantRole")).id)

    const channel = member.guild.channels.resolve(applicant.channelID)
    if (!channel) throw Error(`channel does not exist for applicant: ${applicant.tag}`)

    await channel.createOverwrite(member.user, { VIEW_CHANNEL: true })

    if (!isTextChannel(channel))
    throw Error(`applicant channel is not text channel for applicant: ${applicant.tag}`)

    await channel.send(appResponse(applicant)).catch(console.error)
  }
}