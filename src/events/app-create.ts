import slugify from "@sindresorhus/slugify"
import { Events } from "discord.js"
import type { Event } from "discord-bot-shared"
import { isErr } from "ts-explicit-errors"

import { saveApplicant } from "~/applicant/applicant-db.ts"
import type { Applicant } from "~/generated/prisma/client.ts"
import { getResolvedSettings } from "~/settings/settings-db.ts"

export const appCreate: Event = {
  event: Events.MessageCreate,
  handler: async (_, message) => {
    const { guild } = message
    if (!guild) return

    const settings = await getResolvedSettings(guild)
    if (isErr(settings)) return

    const { appsCategory, appsChannel } = settings

    if (message.channelId !== appsChannel.id) return

    const embed = message.embeds[0]
    if (!embed) throw new Error("failed to get embed from message")
    const { fields } = embed

    const discordUsername = fields.find((element) => element.name === "Discord Username")?.value
    if (!discordUsername) throw new Error("failed to get username from fields")

    const username = slugify(discordUsername)

    const warcraftlogs = fields.find((element) => element.name.toLowerCase().includes("warcraftlogs"))?.value

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

    const saveApplicantResult = await saveApplicant(applicant)
    if (isErr(saveApplicantResult)) throw new Error(saveApplicantResult.messageChain)
  },
}
