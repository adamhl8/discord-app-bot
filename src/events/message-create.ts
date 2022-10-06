import { getChannel, throwError } from "discord-bot-shared"
import { CategoryChannel, ChannelType, Message } from "discord.js"
import { Applicant, parseApplicantName, saveApplicant } from "../applicant.js"
import { getSettings } from "../commands/settings.js"
import bot from "../index.js"

bot.on("messageCreate", (message) => {
  void handleMessageCreate(message).catch(console.error)
})

async function handleMessageCreate(message: Message) {
  const settings = await getSettings()
  if (!settings) return

  if (message.channelId !== settings.appsChannel.id) return

  const embed = message.embeds[0] || throwError("Unable to get embed.")
  const fields = embed.fields
  const tag = fields.find((element) => element.name === "Discord Tag")?.value || throwError("Unable to get tag.")
  const name = parseApplicantName(tag) || throwError("Unable to get name.")

  const warcraftlogs = fields.find((element) => element.name.toLowerCase().includes("warcraftlogs"))?.value

  const appsCategory =
    (await getChannel<CategoryChannel>(settings.appsCategory.id, ChannelType.GuildCategory)) || throwError("Unable to get Apps category.")

  const channel = (await appsCategory.children.create({ name })) || throwError("Unable to create channel.")
  await channel.send({ embeds: message.embeds })

  const applicant: Applicant = {
    tag,
    name,
    appMessageId: message.id,
    channelId: channel.id,
  }

  if (warcraftlogs) applicant.warcraftlogs = warcraftlogs

  await saveApplicant(applicant)
}
