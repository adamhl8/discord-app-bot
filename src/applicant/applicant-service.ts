import { getChannel, throwUserError } from "discord-bot-shared"
import { ChannelType, ChatInputCommandInteraction, Guild } from "discord.js"
import getUrls from "get-urls"
import { ApplicantWithSettings, getApplicantOrThrow } from "./applicant-db.js"

async function getCommonDetails(interaction: ChatInputCommandInteraction<"cached">) {
  const guild = interaction.guild
  const applicantChannel = interaction.options.getChannel("channel", true, [ChannelType.GuildText])
  const applicant = await getApplicantOrThrow(applicantChannel.name, guild.id)
  const settings = applicant.guildSettings

  return { guild, applicantChannel, applicant, settings }
}

async function reactToApplication(guild: Guild, applicant: ApplicantWithSettings, emojiName: string) {
  const appsChannel = await getChannel(guild, applicant.guildSettings.appsChannelId, ChannelType.GuildText)
  const emojis = await guild.emojis.fetch()
  const emoji =
    emojis.find((emoji) => emoji.name === emojiName) ?? throwUserError(`Failed to find emoji with name: ${emojiName}`)
  const appMessage = await appsChannel.messages.fetch(applicant.appMessageId)
  await appMessage.react(emoji)
}

async function sendWarcraftlogsMessage(guild: Guild, applicant: ApplicantWithSettings) {
  const settings = applicant.guildSettings
  if (!(settings.postLogs && settings.postLogsChannelId && applicant.warcraftlogs)) return

  const warcraftlogsUrls = getUrls(applicant.warcraftlogs)
  let warcraftlogsText = `\n\n`
  for (const url of warcraftlogsUrls) {
    warcraftlogsText += `${url}\n`
  }

  const postLogsChannel = await getChannel(guild, settings.postLogsChannelId, ChannelType.GuildText)

  await postLogsChannel.send(`New Applicant: <@${applicant.memberId}>${warcraftlogsText}`)
}

export { getCommonDetails, reactToApplication, sendWarcraftlogsMessage }
