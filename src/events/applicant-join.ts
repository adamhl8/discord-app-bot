import slugify from "@sindresorhus/slugify"
import { Events } from "discord.js"
import type { Event } from "discord-bot-shared"

import { getApplicant } from "../applicant/applicant-db.ts"
import { sendWarcraftlogsMessage } from "../applicant/applicant-service.ts"
import { linkMemberToApp } from "../applicant/link-applicant.ts"
import { getSettingsOrThrow } from "../settings/settings-db.ts"

export const applicantJoin: Event = {
  event: Events.GuildMemberAdd,
  async handler(client, member) {
    const guild = await client.guilds.fetch(member.guild.id)
    const settings = await getSettingsOrThrow(guild.id)

    const username = slugify(member.user.tag)
    const applicant = await getApplicant(username, guild.id)
    if (!applicant) return

    await linkMemberToApp(guild, settings.applicantRoleId, member, applicant)
    await sendWarcraftlogsMessage(guild, settings.postLogs, settings.postLogsChannelId, applicant)
  },
}
