import { throwError } from "discord-bot-shared"
import { ChannelType, Client, GuildMember, TextChannel } from "discord.js"
import { appResponse, getApplicant, parseApplicantName, saveApplicant } from "../applicant.js"
import { getGuildInfo, sendWarcraftlogsMessage } from "../util.js"

function registerGuildMemberAdd(bot: Client) {
  bot.on("guildMemberAdd", (member) => {
    void handleGuildMemberAdd(member).catch(console.error)
  })
}

async function handleGuildMemberAdd(member: GuildMember) {
  const { guild, settings } = await getGuildInfo(member.guild.id)
  if (!settings) return

  const name = parseApplicantName(member.user.tag) || throwError("Unable to parse applicant name.")
  const applicant = await getApplicant(name, guild.id)
  if (!applicant) return

  await member.roles.add(settings.applicantRole.id)
  applicant.memberId = member.id
  await saveApplicant(applicant, guild.id)

  const channel = (await guild.getChannel<TextChannel>(applicant.channelId, ChannelType.GuildText)) || throwError("Unable to get channel.")
  await channel.permissionOverwrites.create(member.user, { ViewChannel: true })
  await channel.send(appResponse(member.toString()))

  if (applicant.warcraftlogs) await sendWarcraftlogsMessage({ guild, settings }, member.toString(), applicant.warcraftlogs)
}

export default registerGuildMemberAdd
