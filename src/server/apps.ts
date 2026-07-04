import { sValidator } from "@hono/standard-validator"
import slugify from "@sindresorhus/slugify"
import { type } from "arktype"
import type { Client, Message } from "discord.js"
import { Hono } from "hono"
import { attempt, err, isErr } from "ts-explicit-errors"

import { saveApplicant } from "#/applicant/applicant-db.ts"
import type { Applicant } from "#/generated/prisma/client.ts"
import { buildAppMessages } from "#/server/app-messages.ts"
import { getResolvedSettings } from "#/settings/settings-db.ts"

const applicationPayloadSchema = type({
  guildId: "string.digits > 0",
  title: "string > 0",
  fields: type({ name: "string > 0", value: "string" }).array().atLeastLength(1),
})

export const apps = (client: Client) => {
  const hono = new Hono()

  hono.post("/", sValidator("json", applicationPayloadSchema), async (c) => {
    const { fields, title, guildId } = c.req.valid("json")

    const discordUsername = fields.find((field) => field.name === "Discord Username")?.value.trim()
    if (!discordUsername) return c.json({ error: "missing 'Discord Username' field" }, 400)
    const username = slugify(discordUsername)

    const warcraftlogs = fields.find((field) => field.name.toLowerCase().includes("warcraftlogs"))?.value

    const guild = await attempt(async () => client.guilds.fetch(guildId))
    if (isErr(guild)) return c.json({ error: `failed to fetch guild '${guildId}'` }, 404)

    const settings = await getResolvedSettings(guild)
    if (isErr(settings)) return c.json({ error: settings.messageChain }, 500)
    const { appsCategory, appsChannel } = settings

    const appMessages = buildAppMessages(title, fields)

    const sentAppMessages = await attempt(async () => {
      const sent: Message[] = []
      // oxlint-disable-next-line no-await-in-loop - need to send the messages in order
      for (const message of appMessages) sent.push(await appsChannel.send(message))
      return sent
    })
    if (isErr(sentAppMessages))
      return c.json({ error: err("failed to send app message", sentAppMessages).messageChain }, 500)

    const appMessage = sentAppMessages.at(-1)
    if (!appMessage) return c.json({ error: "no app messages were sent" }, 500)

    const applicantChannel = await attempt(async () => appsCategory.children.create({ name: username }))
    if (isErr(applicantChannel))
      return c.json({ error: err("failed to create applicant channel", applicantChannel).messageChain }, 500)

    const applicantChannelSend = await attempt(async () => {
      // oxlint-disable-next-line no-await-in-loop - need to send the messages in order
      for (const message of appMessages) await applicantChannel.send(message)
    })
    if (isErr(applicantChannelSend)) {
      return c.json(
        { error: err("failed to send app message to applicant channel", applicantChannelSend).messageChain },
        500,
      )
    }

    const applicant: Applicant = {
      username,
      appMessageId: appMessage.id,
      channelId: applicantChannel.id,
      memberId: null,
      declineMessageId: null,
      kick: null,
      warcraftlogs: warcraftlogs ?? null,
      guildId: guild.id,
    }

    const saveApplicantResult = await saveApplicant(applicant)
    if (isErr(saveApplicantResult)) return c.json({ error: saveApplicantResult.messageChain }, 500)

    return c.json({ success: true }, 201)
  })

  return hono
}
