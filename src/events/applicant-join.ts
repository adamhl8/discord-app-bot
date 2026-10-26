import slugify from "@sindresorhus/slugify"
import type { Event } from "discord-bot-shared"
import { Events } from "discord.js"
import { err, isErr, messageChain } from "ts-explicit-errors"

import { getApplicant } from "#applicant/applicant-db.ts"
import { linkMemberToApp, sendWarcraftlogsMessage } from "#applicant/applicant-service.ts"
import { getGuildTextChannel } from "#guild-utils.ts"

export const applicantJoin: Event = {
  event: Events.GuildMemberAdd,
  handler: async (_, member) => {
    const { guild } = member

    const username = slugify(member.user.tag)
    const applicant = await getApplicant(username, guild)
    if (isErr(applicant)) return

    const applicantChannel = await getGuildTextChannel(guild, applicant.channelId)
    if (isErr(applicantChannel)) return

    const linkMemberToAppResult = await linkMemberToApp(member, applicantChannel)
    if (isErr(linkMemberToAppResult))
      throw new Error(messageChain(err("failed to link member to app", linkMemberToAppResult)))

    const sendWarcraftlogsMessageResult = await sendWarcraftlogsMessage(applicantChannel)
    if (isErr(sendWarcraftlogsMessageResult))
      throw new Error(messageChain(err("failed to send Warcraft Logs message", sendWarcraftlogsMessageResult)))
  },
}
