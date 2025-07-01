import type { Applicant } from "@prisma/client"
import slugify from "@sindresorhus/slugify"
import { ChannelType, Events } from "discord.js"
import type { Event } from "discord-bot-shared"
import { getChannel, throwError } from "discord-bot-shared"

import { saveApplicant } from "../applicant/applicant-db.ts"
import { getSettingsOrThrow } from "../settings/settings-db.ts"

export const appCreate: Event = {
  event: Events.MessageCreate,
  async handler(client, message) {
    if (!message.guildId) return
    const guild = await client.guilds.fetch(message.guildId)
    const settings = await getSettingsOrThrow(guild.id)

    if (message.channelId !== settings.appsChannelId) return

    const embed = message.embeds[0] ?? throwError("Failed to get embed from message.")
    const fields = embed.fields
    const discordUsername =
      fields.find((element) => element.name === "Discord Username")?.value ??
      throwError("Failed to get username from fields.")
    const username = slugify(discordUsername)

    const warcraftlogs = fields.find((element) => element.name.toLowerCase().includes("warcraftlogs"))?.value

    const appsCategory = await getChannel(guild, settings.appsCategoryId, ChannelType.GuildCategory)
    const applicantChannel = await appsCategory.children.create({ name: username })
    await applicantChannel.send({ embeds: message.embeds })

    const applicant: Applicant = {
      username,
      appMessageId: message.id,
      channelId: applicantChannel.id,
      memberId: null,
      declineMessageId: null,
      kick: null,
      warcraftlogs: warcraftlogs ?? null,
      guildId: guild.id,
    }

    await saveApplicant(applicant)
  },
}
