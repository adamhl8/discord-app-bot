import slugify from "@sindresorhus/slugify"
import { Event, getChannel } from "discord-bot-shared"
import { ChannelType, Events } from "discord.js"
import { getApplicant, saveApplicant } from "../applicant/applicant-db.js"
import { appResponse } from "../applicant/applicant-service.js"
import { getSettings } from "../settings/settings-db.js"
import { sendWarcraftlogsMessage } from "../util.js"

const GuildMemberAdd: Event<Events.GuildMemberAdd> = {
  event: Events.GuildMemberAdd,
  async handler(context, member) {
    const guild = await context.client.guilds.fetch(member.guild.id)
    const settings = await getSettings(guild.id)

    const username = slugify(member.user.tag)
    const applicant = await getApplicant(username, guild.id)

    await member.roles.add(settings.applicantRoleId)
    applicant.memberId = member.id
    await saveApplicant(applicant)

    const channel = await getChannel(guild, applicant.channelId, ChannelType.GuildText)
    await channel.permissionOverwrites.create(member.user, { ViewChannel: true })
    await channel.send(appResponse(member.toString()))

    if (applicant.warcraftlogs)
      await sendWarcraftlogsMessage(guild, settings, member.toString(), applicant.warcraftlogs)
  },
}

export default GuildMemberAdd
