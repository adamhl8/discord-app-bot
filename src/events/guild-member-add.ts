import { getChannel, throwError } from "discord-bot-shared"
import { ChannelType, GuildMember, TextChannel } from "discord.js"
import { appResponse, getApplicant, parseApplicantName, saveApplicant } from "../applicant.js"
import { getSettings } from "../commands/settings.js"
import bot from "../index.js"
import { sendWarcraftlogsEmbed } from "../util.js"

bot.on("guildMemberAdd", (member) => {
  void handleGuildMemberAdd(member).catch(console.error)
})

async function handleGuildMemberAdd(member: GuildMember) {
  const name = parseApplicantName(member.user.tag) || throwError("Unable to parse applicant name.")
  const applicant = await getApplicant(name)
  if (!applicant) return
  const settings = (await getSettings()) || throwError("Unable to get settings.")

  await member.roles.add(settings.applicantRole.id)
  applicant.memberId = member.id
  await saveApplicant(applicant)

  const channel = (await getChannel<TextChannel>(applicant.channelId, ChannelType.GuildText)) || throwError("Unable to get channel.")
  await channel.permissionOverwrites.create(member.user, { ViewChannel: true })
  await channel.send(appResponse(member.toString()))

  if (applicant.warcraftlogs) await sendWarcraftlogsEmbed(member.toString(), applicant.warcraftlogs)
}
