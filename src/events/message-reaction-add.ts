import { getGuildCache, isTextChannel, throwError } from "discord-bot-shared"
import { MessageReaction, User } from "discord.js"
import { getApplicant, removeApplicant } from "../applicant.js"
import { getSettings } from "../commands/settings.js"
import bot from "../index.js"

bot.on("messageReactionAdd", async (reactionOrPartial, userOrPartial) => {
  const reaction = await reactionOrPartial.fetch().catch(console.error)
  if (!reaction) return
  const user = await userOrPartial.fetch().catch(console.error)
  if (!user) return

  void handleMessageReactionAdd(reaction, user).catch(console.error)
})

async function handleMessageReactionAdd(reaction: MessageReaction, user: User) {
  const channel = reaction.message.channel
  if (!isTextChannel(channel)) return

  if (!reaction.message.guildId) throwError("Unable to get guild ID.")
  const applicant = await getApplicant(channel.name, reaction.message.guildId)
  if (!applicant) return

  if (reaction.message.id !== applicant.declineMessageId) return

  const { members } = (await getGuildCache(reaction.message.guildId)) || throwError("Unable to get guild cache.")
  const guildMember = members.get(user.id) || throwError(`Unable to get guild member.`)

  const settings = (await getSettings(reaction.message.guildId)) || throwError("Unable to get settings.")

  const officerRoleId = settings.officerRole.id
  if (!(guildMember.id === applicant.memberId || guildMember.roles.cache.has(officerRoleId))) return

  await channel.delete()

  if (!applicant.memberId) return
  const member = members.get(applicant.memberId) || throwError(`Unable to get member.`)

  await (applicant.kick ? member.kick() : member.roles.remove(settings.applicantRole.id))

  await removeApplicant(applicant, reaction.message.guildId)
}
