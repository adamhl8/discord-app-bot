import { ChannelType, Events, MessageFlags } from "discord.js"
import type { Event } from "discord-bot-shared"
import { components } from "discord-bot-shared"
import { isErr } from "ts-explicit-errors"

import { getApplicant } from "~/applicant/applicant-db.ts"
import { closeApplication } from "~/applicant/applicant-service.ts"
import { isModerator } from "~/utils.ts"

export const declineConfirm: Event = {
  event: Events.InteractionCreate,
  handler: async (_, interaction) => {
    if (!(interaction.isButton() && interaction.customId === "declineConfirm")) return

    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] })

    const { guild, user, channel: applicantChannel } = interaction
    if (!(applicantChannel?.type === ChannelType.GuildText)) throw new Error("applicantChannel is not a text channel")
    if (!guild) throw new Error("guild is null")

    const applicant = await getApplicant(applicantChannel.name, guild)
    if (isErr(applicant)) throw new Error(applicant.messageChain)
    if (!applicant.memberId) throw new Error("applicant memberId is null")
    const applicantMember = await guild.members.fetch({ user: applicant.memberId })

    const buttonInteractionMember = await guild.members.fetch({ user })
    const isButtonInteractionMemberModerator = await isModerator(buttonInteractionMember)
    if (isErr(isButtonInteractionMemberModerator)) throw new Error(isButtonInteractionMemberModerator.messageChain)

    if (!(buttonInteractionMember.id === applicantMember.id || isButtonInteractionMemberModerator)) {
      await interaction.followUp(components.warn("You do not have permission to do this."))
      return
    }

    const closeApplicationResult = applicant.kick
      ? (await applicantMember.kick()) && (await closeApplication(applicantChannel, "declined", false))
      : await closeApplication(applicantChannel, "declined")
    if (isErr(closeApplicationResult)) throw new Error(closeApplicationResult.messageChain)
  },
}
