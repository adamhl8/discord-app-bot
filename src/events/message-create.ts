import { Applicant } from "@prisma/client"
import slugify from "@sindresorhus/slugify"
import { Event, getChannel, throwError } from "discord-bot-shared"
import { ChannelType, Events } from "discord.js"
import { saveApplicant } from "../applicant/applicant-db.js"
import { getSettings } from "../settings/settings-db.js"

const MessageCreate: Event<Events.MessageCreate> = {
  event: Events.MessageCreate,
  async handler(context, message) {
    if (!message.guildId) return
    const guild = await context.client.guilds.fetch(message.guildId)
    const settings = await getSettings(guild.id)

    if (message.channelId !== settings.appsChannelId) return

    const embed = message.embeds[0] ?? throwError("Failed to get embed from message.")
    const fields = embed.fields
    const discordUsername =
      fields.find((element) => element.name === "Discord Username")?.value ??
      throwError("Failed to get username from fields.")
    const username = slugify(discordUsername)

    const warcraftlogs = fields.find((element) => element.name.toLowerCase().includes("warcraftlogs"))?.value

    const appsCategory = await getChannel(guild, settings.appsCategoryId, ChannelType.GuildCategory)
    const channel = await appsCategory.children.create({ name: username })
    await channel.send({ embeds: message.embeds })

    const applicant: Applicant = {
      username,
      appMessageId: message.id,
      channelId: channel.id,
      memberId: null,
      declineMessageId: null,
      kick: null,
      warcraftlogs: null,
      guildId: guild.id,
    }

    if (warcraftlogs) applicant.warcraftlogs = warcraftlogs

    await saveApplicant(applicant)
  },
}

export default MessageCreate
