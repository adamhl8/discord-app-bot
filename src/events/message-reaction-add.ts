import { Event, isTextChannel, throwError } from "discord-bot-shared"
import { Events } from "discord.js"
import { getApplicant, removeApplicant } from "../applicant/applicant-db.js"
import { getSettings } from "../settings/settings-db.js"

const MessageReactionAdd: Event<Events.MessageReactionAdd> = {
  event: Events.MessageReactionAdd,
  async handler(context, reactionOrPartial, userOrPartial) {
    const reaction = await reactionOrPartial.fetch()
    const user = await userOrPartial.fetch()

    if (!reaction.message.guildId) return
    const guild = await context.client.guilds.fetch(reaction.message.guildId)
    const settings = await getSettings(guild.id)

    const channel = reaction.message.channel
    if (!isTextChannel(channel)) return

    const applicant = await getApplicant(channel.name, guild.id)

    if (reaction.message.id !== applicant.declineMessageId) return

    const members = await guild.members.fetch()
    const guildMember = members.get(user.id) ?? throwError(`Failed to get member with ID: ${user.id}`)

    const officerRoleId = settings.officerRoleId
    if (!(guildMember.id === applicant.memberId || guildMember.roles.cache.has(officerRoleId))) return

    await channel.delete()

    if (!applicant.memberId) return
    const member = members.get(applicant.memberId) ?? throwError(`Failed to get member with ID: ${applicant.memberId}`)

    await (applicant.kick ? member.kick() : member.roles.remove(settings.applicantRoleId))

    await removeApplicant(applicant)
  },
}

export default MessageReactionAdd
