import { Event, getChannel, throwError } from "discord-bot-shared"
import { ChannelType, TextChannel } from "discord.js"
import { appResponse, getApplicant, parseApplicantName, saveApplicant } from "../applicant.js"
import { getSettings } from "../commands/settings.js"
import { sendWarcraftlogsMessage } from "../util.js"

const event: Event<"guildMemberAdd"> = {
  name: "guildMemberAdd",
  async handler(context, member) {
    const guild = await context.client.guilds.fetch(member.guild.id)
    const settings = await getSettings(guild.id)
    if (!settings) return

    const name = parseApplicantName(member.user.tag) || throwError("Unable to parse applicant name.")
    const applicant = await getApplicant(name, guild.id)
    if (!applicant) return

    await member.roles.add(settings.applicantRole.id)
    applicant.memberId = member.id
    await saveApplicant(applicant, guild.id)

    const channel = await getChannel<TextChannel>(guild, applicant.channelId, ChannelType.GuildText)
    if (!channel) throwError("Unable to get channel.")

    await channel.permissionOverwrites.create(member.user, { ViewChannel: true })
    await channel.send(appResponse(member.toString()))

    if (applicant.warcraftlogs) await sendWarcraftlogsMessage({ guild, settings }, member.toString(), applicant.warcraftlogs)
  },
}

export default event
