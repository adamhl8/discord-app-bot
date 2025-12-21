import { ChannelType, SlashCommandBuilder } from "discord.js"
import type { Command } from "discord-bot-shared"
import { err, isErr } from "ts-explicit-errors"

import { linkMemberToApp, sendWarcraftlogsMessage } from "~/applicant/applicant-service.ts"

export const link: Command = {
  command: new SlashCommandBuilder()
    .setName("link")
    .setDescription("Link an applicant.")
    .addUserOption((option) =>
      option
        .setName("applicant")
        .setDescription("The applicant to be linked to the selected channel.")
        .setRequired(true),
    )
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("Select the channel that the applicant will be linked to.")
        .setRequired(true),
    ),
  run: async (interaction) => {
    await interaction.deferReply()

    const applicantChannel = interaction.options.getChannel("channel", true, [ChannelType.GuildText])

    const user = interaction.options.getUser("applicant", true)
    const member = await interaction.guild.members.fetch({ user: user.id })

    const linkMemberToAppResult = await linkMemberToApp(member, applicantChannel)
    if (isErr(linkMemberToAppResult))
      throw new Error(err("failed to link member to app", linkMemberToAppResult).messageChain)
    const sendWarcraftlogsMessageResult = await sendWarcraftlogsMessage(applicantChannel)
    if (isErr(sendWarcraftlogsMessageResult))
      throw new Error(err("failed to send Warcraft Logs message", sendWarcraftlogsMessageResult).messageChain)

    await interaction.editReply(`${member.toString()} has been linked to ${applicantChannel.toString()}.`)
  },
}
