import { Event } from "discord-bot-shared"
import { Events } from "discord.js"
import { getApplicant, removeApplicant } from "../applicant/applicant-db.js"
import { getSettingsOrThrow } from "../settings/settings-db.js"
import { fetchMemberById } from "../util.js"

const appReactionAdd: Event = {
  event: Events.MessageReactionAdd,
  async handler(client, reactionOrPartial, userOrPartial) {
    const reaction = await reactionOrPartial.fetch()
    const user = await userOrPartial.fetch()
    if (!reaction.message.guildId) return

    const guild = await client.guilds.fetch(reaction.message.guildId)
    const settings = await getSettingsOrThrow(guild.id)

    const channel = reaction.message.channel
    if (!("name" in channel)) return

    const applicant = await getApplicant(channel.name, guild.id)
    if (!applicant?.memberId) return

    if (reaction.message.id !== applicant.declineMessageId) return

    const reactionMember = await fetchMemberById(guild, user.id)
    if (!(reactionMember.id === applicant.memberId || reactionMember.roles.cache.has(settings.officerRoleId))) return

    await channel.delete()

    const member = await fetchMemberById(guild, applicant.memberId)
    await (applicant.kick ? member.kick() : member.roles.remove(settings.applicantRoleId))

    await removeApplicant(applicant)
  },
}

export default appReactionAdd
