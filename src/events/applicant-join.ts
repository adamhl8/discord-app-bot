import slugify from "@sindresorhus/slugify"
import { Event } from "discord-bot-shared"
import { Events } from "discord.js"
import { getApplicant } from "../applicant/applicant-db.js"
import { sendWarcraftlogsMessage } from "../applicant/applicant-service.js"
import { linkMemberToApp } from "../applicant/link-applicant.js"

const applicantJoin: Event = {
  event: Events.GuildMemberAdd,
  async handler(client, member) {
    const guild = await client.guilds.fetch(member.guild.id)

    const username = slugify(member.user.tag)
    const applicant = await getApplicant(username, guild.id)
    if (!applicant) return

    await linkMemberToApp(guild, member, applicant)
    await sendWarcraftlogsMessage(guild, applicant)
  },
}

export default applicantJoin
