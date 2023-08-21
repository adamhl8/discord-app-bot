import slugify from "@sindresorhus/slugify"
import { Event, getChannel, throwError } from "discord-bot-shared"
import { CategoryChannel, ChannelType, Events } from "discord.js"
import { Applicant, saveApplicant } from "../applicant.js"
import { getSettings } from "../commands/settings.js"

const event: Event<Events.MessageCreate> = {
  event: Events.MessageCreate,
  async handler(context, message) {
    if (!message.guildId) return
    const guild = await context.client.guilds.fetch(message.guildId)
    const settings = await getSettings(guild.id)

    if (message.channelId !== settings.appsChannel.id) return

    const embed = message.embeds[0] ?? throwError("Unable to get embed.")
    const fields = embed.fields
    const discordUsername =
      fields.find((element) => element.name === "Discord Username")?.value ?? throwError("Unable to get username.")
    const username = slugify(discordUsername)

    const warcraftlogs = fields.find((element) => element.name.toLowerCase().includes("warcraftlogs"))?.value

    const appsCategory = await getChannel<CategoryChannel>(guild, settings.appsCategory.id, ChannelType.GuildCategory)
    const channel = await appsCategory.children.create({ name: username })
    await channel.send({ embeds: message.embeds })

    const applicant: Applicant = {
      username,
      appMessageId: message.id,
      channelId: channel.id,
    }

    if (warcraftlogs) applicant.warcraftlogs = warcraftlogs

    await saveApplicant(applicant, guild.id)
  },
}

export default event
