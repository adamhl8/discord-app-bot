import { Applicant } from "@prisma/client"
import { getChannel, throwUserError } from "discord-bot-shared"
import { ChannelType, ChatInputCommandInteraction, Guild } from "discord.js"
import getUrls from "get-urls"
import { getSettingsOrThrow } from "../settings/settings-db.js"
import { getApplicantOrThrow } from "./applicant-db.js"

async function getCommonDetails(interaction: ChatInputCommandInteraction<"cached">) {
  const guild = interaction.guild
  const applicantChannel = interaction.options.getChannel("channel", true, [ChannelType.GuildText])
  const applicant = await getApplicantOrThrow(applicantChannel.name, guild.id)
  const settings = await getSettingsOrThrow(guild.id)

  return { guild, applicantChannel, applicant, settings }
}

async function reactToApplication(guild: Guild, appsChannelId: string, applicant: Applicant, emojiName: string) {
  const appsChannel = await getChannel(guild, appsChannelId, ChannelType.GuildText)
  const emojis = await guild.emojis.fetch()
  const emoji =
    emojis.find((emoji) => emoji.name === emojiName) ?? throwUserError(`Failed to find emoji with name: ${emojiName}`)
  const appMessage = await appsChannel.messages.fetch(applicant.appMessageId)
  await appMessage.react(emoji)
}

async function sendWarcraftlogsMessage(
  guild: Guild,
  postLogs: boolean,
  postLogsChannelId: string | null,
  applicant: Applicant,
) {
  if (!(postLogs && postLogsChannelId && applicant.warcraftlogs)) return

  const warcraftlogsUrls = getUrls(applicant.warcraftlogs)
  let warcraftlogsText = `\n\n`
  for (const url of warcraftlogsUrls) {
    warcraftlogsText += `${url}\n`
  }

  const postLogsChannel = await getChannel(guild, postLogsChannelId, ChannelType.GuildText)

  await postLogsChannel.send(`New Applicant: <@${applicant.memberId}>${warcraftlogsText}`)
}

export { getCommonDetails, reactToApplication, sendWarcraftlogsMessage }
