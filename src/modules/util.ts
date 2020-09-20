import Discord, { Collection, Role, Snowflake, GuildMember, Message } from "discord.js"
import ObjectCache from "./ObjectCache"
import { Applicant, channelCache, applicants, roleCache } from "../app-bot"

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
  const byName: Array<[string, T]> = Array.from(entries).map(([, item]) => [item.name, item])

  return new ObjectCache(byName)
}

export async function handleApp(msg: Message, guild: Discord.Guild): Promise<Applicant> {

  const tag = msg.embeds[0].fields[0].value

  let match = /(\w+)#(\d+)/g.exec(tag);

  if (!match) {
    throw Error(`unable to match Discord Tag in message: ${msg}`)
  }

  let name = match[1] + match[2];
  name = name.toLowerCase()

  try {
    const channel = await guild.channels.create(name, {
      parent: channelCache.getOrThrow("applicants").id
    })
    return {
      tag,
      name,
      channel,
    }
  } catch (e) {
    throw Error(`failed to create channel for ${tag} | ${e}`)
  }
}

export function handlePermissions(member: GuildMember) {
  let match = /(\w+)#(\d+)/g.exec(member.user.tag);

  if (!match) {
    console.log(`unable to match Discord Tag: ${member.user.tag}`)
    return
  }

  let name = match[1] + match[2];
  name = name.toLowerCase()

  if (applicants[name]) {

    applicants[name].member = member

    member.roles.add(roleCache.getOrThrow("Applicant").id)

    //@ts-ignore
    applicants[name].channel.createOverwrite(member.user, { VIEW_CHANNEL: true })
    //@ts-ignore
    applicants[name].channel.send("<@" + applicants[name].member.id + ">\n\n" + "Thank you for your application. Once a decision has been made, you will be messaged/pinged with a response.")
  }
}