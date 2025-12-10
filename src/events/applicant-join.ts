import slugify from "@sindresorhus/slugify"
import { Events } from "discord.js"
import type { Event } from "discord-bot-shared"

import { getApplicant } from "~/applicant/applicant-db.ts"
import { sendWarcraftlogsMessage } from "~/applicant/applicant-service.ts"
import { linkMemberToApp } from "~/applicant/link-applicant.ts"
import { getSettings } from "~/settings/settings-db.ts"

export const applicantJoin: Event = {
  event: Events.GuildMemberAdd,
  async handler(client, member) {
    const guild = await client.guilds.fetch(member.guild.id)

    const settings = await getSettings(guild.id)
    if (!settings) return

    const { applicantRoleId } = settings
    if (!applicantRoleId) return

    const username = slugify(member.user.tag)
    const applicant = await getApplicant(username, guild.id)
    if (!applicant) return

    await linkMemberToApp(guild, applicantRoleId, member, applicant)
    await sendWarcraftlogsMessage(guild, settings, applicant)
  },
}
