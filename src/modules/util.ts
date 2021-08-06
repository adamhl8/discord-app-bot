import slugify from '@sindresorhus/slugify'
import Discord, {
  Channel,
  Collection,
  GuildMember,
  Message,
  MessageReaction,
  Snowflake,
  TextChannel,
  User,
} from 'discord.js'
import Storage from 'node-persist'
import { cache } from '../index'
import { Applicant, getApplicant, removeApplicant, saveApplicant } from './applicant'
import ObjectCache from './object-cache'
import { appResponse } from './text'

export async function initStorage(): Promise<void> {
  await Storage.init()

  if (!(await Storage.getItem('officerRole'))) await Storage.setItem('officerRole', 'officer')
  if (!(await Storage.getItem('applicantRole'))) await Storage.setItem('applicantRole', 'applicant')
  if (!(await Storage.getItem('appsChannel'))) await Storage.setItem('appsChannel', 'apps')
  if (!(await Storage.getItem('applicantsCategory'))) await Storage.setItem('applicantsCategory', 'applicants')
  if (!(await Storage.getItem('declineMessage'))) await Storage.setItem('declineMessage', '')
}

export async function memberPermissions(member: GuildMember): Promise<Record<string, boolean>> {
  const roles = member.roles.cache
  const officerRole = (await Storage.getItem('officerRole')) as string

  const isModerator = roles.has(cache.roles.getOrThrow(officerRole).id)
  const isAdmin = member.hasPermission('ADMINISTRATOR')

  return {
    isModerator,
    isAdmin,
  }
}

export function collectionToCacheByName<T extends { name: string }>(
  collection: Collection<Snowflake, T>,
): ObjectCache<T> {
  const entries = collection.entries()
  const byName: Array<[string, T]> = [...entries].map(([, item]) => {
    const key = item.name.toLowerCase()
    return [key, item]
  })

  return new ObjectCache(byName)
}

export function parseApplicantName(tag: string): string {
  const match = /(.+)#.*?(\d+)/g.exec(tag)

  const fallbackMatch = /.+/g.exec(tag)
  if (!fallbackMatch) throw new Error(`unable to match Discord Tag: ${tag}`)

  if (!match) return slugify(fallbackMatch[0].trim())

  return slugify(match[1].trim()) + match[2]
}

export async function handleApp(message: Message, guild: Discord.Guild): Promise<Applicant> {
  const fields = message.embeds[0].fields
  let tag

  for (const element of fields) {
    if (element.name === 'Discord Tag') {
      tag = element.value
      break
    }
  }

  if (!tag) throw new Error('tag is undefined')

  const name = parseApplicantName(tag)

  try {
    const applicantsCategory = (await Storage.getItem('applicantsCategory')) as string
    const channel = await guild.channels.create(name, {
      parent: cache.channels.getOrThrow(applicantsCategory).id,
    })
    await channel.send(message.embeds[0]).catch(console.error)
    return {
      tag,
      name,
      appMessageID: message.id,
      channelID: channel.id,
    }
  } catch {
    throw new Error(`failed to create channel for ${tag}`)
  }
}

export async function handlePermissions(member: GuildMember): Promise<void> {
  const name = parseApplicantName(member.user.tag)

  const applicant = await getApplicant(name)
  if (!applicant) throw new Error(`applicant does not exist: ${name}`)

  applicant.memberID = member.id
  await saveApplicant(applicant)

  const applicantRole = (await Storage.getItem('applicantRole')) as string
  await member.roles.add(cache.roles.getOrThrow(applicantRole).id)

  const channel = member.guild.channels.resolve(applicant.channelID)
  if (!channel) throw new Error(`channel does not exist for applicant: ${applicant.tag}`)

  await channel.createOverwrite(member.user, { VIEW_CHANNEL: true })

  if (!isTextChannel(channel)) throw new Error(`applicant channel is not text channel for applicant: ${applicant.tag}`)

  await channel.send(appResponse(applicant)).catch(console.error)
}

export function isTextChannel(channel: Channel): channel is TextChannel {
  return channel.type === 'text'
}

export function handleReaction(reaction: MessageReaction, applicant: Applicant, channel: TextChannel): void {
  async function handleReactionUser(user: User) {
    const guildMember = reaction.message.guild?.members.resolve(user.id)
    if (!guildMember) throw new Error(`guild member does not exist for user: ${user.tag} | ${user.id}`)

    if (user.id === applicant.memberID || (await memberPermissions(guildMember)).isMod) {
      await channel.delete().catch(console.error)

      if (!applicant.memberID) return
      const applicantMember = reaction.message.guild?.members.resolve(applicant.memberID)
      if (!applicantMember) throw new Error(`member does not exist: ${applicant.tag} | ${applicant.memberID}`)

      await applicantMember.kick().catch(console.error)

      await removeApplicant(applicant)
    }
  }

  reaction.users.cache.each((user) => {
    void handleReactionUser(user)
  })
}
