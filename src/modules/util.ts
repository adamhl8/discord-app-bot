import Discord, { Collection, Role, Snowflake, GuildMember, Message, TextChannel, Channel } from "discord.js"
import ObjectCache from "./ObjectCache"
import { channelCache, roleCache } from "../app-bot"
import { Applicant, getApplicant, saveApplicant } from "./Applicant"

// set up global error handlers
process.on("unhandledRejection", (error) => {
  console.log("unhandledRejection: ", error)
})

export function isMod(member: GuildMember, roleCache: ObjectCache<Role>) {
  const roles = member.roles.cache
  return roles.has(roleCache.getOrThrow("Officer").id)
}

export function collectionToCacheByName<T extends { name: string }>(
  collection: Collection<Snowflake, T>
): ObjectCache<T> {
  const entries = collection.entries()
  const byName: Array<[string, T]> = Array.from(entries).map(([, item]) => [item.name.toLowerCase(), item])

  return new ObjectCache(byName)
}

export function parseApplicantName(tag: string): string {
  let match = /(\w+)#(\d+)/g.exec(tag)

  if (!match) throw Error(`unable to match Discord Tag: ${tag}`)

  let name = match[1] + match[2]
  return name.toLowerCase()
}

export async function handleApp(msg: Message, guild: Discord.Guild): Promise<Applicant> {
  const fields = msg.embeds[0].fields
  let tag

  for (let e of fields) {
    if (e.name == "Discord Tag") {
      tag = e.value
      break
    }
  }

  if (!tag) throw Error("tag is undefined")

  const name = parseApplicantName(tag)

  try {
    const channel = await guild.channels.create(name, {
      parent: channelCache.getOrThrow("applicants").id,
    })
    return {
      tag,
      name,
      appMessageID: msg.id,
      channelID: channel.id,
    }
  } catch (e) {
    throw Error(`failed to create channel for ${tag} | ${e}`)
  }
}

export async function handlePermissions(member: GuildMember) {
  const name = parseApplicantName(member.user.tag)

  const applicant = await getApplicant(name)
  if (!applicant) throw Error(`applicant does not exist: ${name}`)

  applicant.memberID = member.id
  await saveApplicant(applicant)

  member.roles.add(roleCache.getOrThrow("Applicant").id)

  const channel = member.guild.channels.resolve(applicant.channelID)
  if (!channel) throw Error(`channel does not exist for applicant: ${applicant.tag}`)

  await channel.createOverwrite(member.user, { VIEW_CHANNEL: true })

  if (!isTextChannel(channel))
    throw Error(`applicant channel is not text channel for applicant: ${applicant.tag}`)

  await channel.send(
    "<@" +
    applicant.memberID +
    ">\n\n" +
    "Thank you for your application. Once a decision has been made, you will be messaged/pinged with a response."
  )
}

export function isTextChannel(channel: Channel): channel is TextChannel {
  return channel.type === "text"
}
