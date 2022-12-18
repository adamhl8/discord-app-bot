import { Event, isTextChannel, throwError } from "discord-bot-shared"
import { getApplicant, removeApplicant } from "../applicant.js"
import { getSettings } from "../commands/settings.js"

const event: Event<"messageReactionAdd"> = {
  name: "messageReactionAdd",
  async handler(context, reactionOrPartial, userOrPartial) {
    const reaction = await reactionOrPartial.fetch()
    if (!reaction) return
    const user = await userOrPartial.fetch()
    if (!user) return

    if (!reaction.message.guildId) return
    const guild = await context.client.guilds.fetch(reaction.message.guildId)
    const settings = await getSettings(guild.id)
    if (!settings) return

    const channel = reaction.message.channel
    if (!isTextChannel(channel)) return

    const applicant = await getApplicant(channel.name, guild.id)
    if (!applicant) return

    if (reaction.message.id !== applicant.declineMessageId) return

    const members = await guild.members.fetch()
    const guildMember = members.get(user.id) || throwError(`Unable to get guild member.`)

    const officerRoleId = settings.officerRole.id
    if (!(guildMember.id === applicant.memberId || guildMember.roles.cache.has(officerRoleId))) return

    await channel.delete()

    if (!applicant.memberId) return
    const member = members.get(applicant.memberId) || throwError(`Unable to get member.`)

    await (applicant.kick ? member.kick() : member.roles.remove(settings.applicantRole.id))

    await removeApplicant(applicant, guild.id)
  },
}

export default event
