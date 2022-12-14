import { throwError } from "discord-bot-shared"
import { CategoryChannel, ChannelType, Client, Message } from "discord.js"
import { Applicant, parseApplicantName, saveApplicant } from "../applicant.js"
import { getGuildInfo } from "../util.js"

function registerMessageCreate(bot: Client) {
  bot.on("messageCreate", (message) => {
    void handleMessageCreate(message).catch(console.error)
  })
}

async function handleMessageCreate(message: Message) {
  if (!message.guildId) return
  const { guild, settings } = await getGuildInfo(message.guildId)
  if (!settings) return

  if (message.channelId !== settings.appsChannel.id) return

  const embed = message.embeds[0] || throwError("Unable to get embed.")
  const fields = embed.fields
  const tag = fields.find((element) => element.name === "Discord Tag")?.value || throwError("Unable to get tag.")
  const name = parseApplicantName(tag) || throwError("Unable to get name.")

  const warcraftlogs = fields.find((element) => element.name.toLowerCase().includes("warcraftlogs"))?.value

  const appsCategory =
    (await guild.getChannel<CategoryChannel>(settings.appsCategory.id, ChannelType.GuildCategory)) ||
    throwError("Unable to get Apps category.")

  const channel = (await appsCategory.children.create({ name })) || throwError("Unable to create channel.")
  await channel.send({ embeds: message.embeds })

  const applicant: Applicant = {
    tag,
    name,
    appMessageId: message.id,
    channelId: channel.id,
  }

  if (warcraftlogs) applicant.warcraftlogs = warcraftlogs

  await saveApplicant(applicant, guild.id)
}

export default registerMessageCreate
