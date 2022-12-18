import { Event, getChannel, throwError } from "discord-bot-shared"
import { CategoryChannel, ChannelType } from "discord.js"
import { Applicant, parseApplicantName, saveApplicant } from "../applicant.js"
import { getSettings } from "../commands/settings.js"

const event: Event<"messageCreate"> = {
  name: "messageCreate",
  async handler(context, message) {
    if (!message.guildId) return
    const guild = await context.client.guilds.fetch(message.guildId)
    const settings = await getSettings(guild.id)
    if (!settings) return

    if (message.channelId !== settings.appsChannel.id) return

    const embed = message.embeds[0] || throwError("Unable to get embed.")
    const fields = embed.fields
    const tag = fields.find((element) => element.name === "Discord Tag")?.value || throwError("Unable to get tag.")
    const name = parseApplicantName(tag) || throwError("Unable to get name.")

    const warcraftlogs = fields.find((element) => element.name.toLowerCase().includes("warcraftlogs"))?.value

    const appsCategory = await getChannel<CategoryChannel>(guild, settings.appsCategory.id, ChannelType.GuildCategory)
    if (!appsCategory) throwError("Unable to get Apps category.")

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
  },
}

export default event
