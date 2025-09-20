import type { Applicant } from "@prisma/client"
import type { ChatInputCommandInteraction, Guild } from "discord.js"
import { ChannelType } from "discord.js"
import { getChannel, throwUserError } from "discord-bot-shared"
import getUrls from "get-urls"

import { getApplicantOrThrow } from "~/applicant/applicant-db.ts"
import { getSettingsOrThrow } from "~/settings/settings-db.ts"

/**
 * @param interaction The interaction that triggered the command
 * @returns The guild, applicant channel, applicant, and settings
 */
async function getCommonDetails(interaction: ChatInputCommandInteraction<"cached">) {
  const guild = interaction.guild
  const applicantChannel = interaction.options.getChannel("channel", true, [ChannelType.GuildText])
  const applicant = await getApplicantOrThrow(applicantChannel.name, guild.id)
  const settings = await getSettingsOrThrow(guild.id)

  return { guild, applicantChannel, applicant, settings }
}

/**
 * @param guild The guild
 * @param appsChannelId The ID of the channel where applications are posted
 * @param applicant The applicant
 * @param emojiName The name of the emoji to react with
 */
async function reactToApplication(guild: Guild, appsChannelId: string, applicant: Applicant, emojiName: string) {
  const appsChannel = await getChannel(guild, appsChannelId, ChannelType.GuildText)
  const emojis = await guild.emojis.fetch()
  const emoji =
    emojis.find((emoji_) => emoji_.name === emojiName) ?? throwUserError(`Failed to find emoji with name: ${emojiName}`)
  const appMessage = await appsChannel.messages.fetch(applicant.appMessageId)
  await appMessage.react(emoji)
}

/**
 * @param guild The guild
 * @param postLogs Whether to post the applicant's WarcraftLogs to the post logs channel
 * @param postLogsChannelId The ID of the channel where the post logs are posted
 * @param applicant The applicant
 */
async function sendWarcraftlogsMessage(
  guild: Guild,
  postLogs: boolean,
  postLogsChannelId: string | null,
  applicant: Applicant,
) {
  if (!(postLogs && postLogsChannelId && applicant.warcraftlogs)) return

  const warcraftlogsUrls = getUrls(applicant.warcraftlogs)
  let warcraftlogsText = "\n\n"
  for (const url of warcraftlogsUrls) {
    warcraftlogsText += `${url}\n`
  }

  const postLogsChannel = await getChannel(guild, postLogsChannelId, ChannelType.GuildText)

  await postLogsChannel.send(`New Applicant: <@${applicant.memberId ?? "UNKNOWN"}>${warcraftlogsText}`)
}

export { getCommonDetails, reactToApplication, sendWarcraftlogsMessage }
