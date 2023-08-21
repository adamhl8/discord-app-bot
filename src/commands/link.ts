import { Command, isTextChannel, throwError } from "discord-bot-shared"
import { SlashCommandBuilder } from "discord.js"
import { appResponse, getApplicant, saveApplicant } from "../applicant.js"
import { sendWarcraftlogsMessage } from "../util.js"
import { getSettings } from "./settings.js"

const link: Command = {
  command: new SlashCommandBuilder()
    .setName("link")
    .setDescription("Link an applicant.")
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("Select the channel that the applicant will be linked to.")
        .setRequired(true),
    )
    .addUserOption((option) =>
      option
        .setName("applicant")
        .setDescription("The applicant to be linked to the selected channel.")
        .setRequired(true),
    )
    .toJSON(),
  run: async (context, interaction) => {
    const guild = context.guild
    const settings = await getSettings(guild.id)

    await interaction.deferReply()

    const channel = interaction.options.getChannel("channel") ?? throwError("Unable to get channel.")
    if (!isTextChannel(channel)) throwError("Channel is not a text channel.")

    const applicant = await getApplicant(channel.name, guild.id)
    const user = interaction.options.getUser("applicant") ?? throwError(`Unable to get user.`)

    const members = await guild.members.fetch()
    const member = members.get(user.id) ?? throwError(`Unable to get member.`)

    applicant.memberId = member.id
    await saveApplicant(applicant, guild.id)

    await member.roles.add(settings.applicantRole.id)
    await channel.permissionOverwrites.create(member.user, { ViewChannel: true })
    await channel.send(appResponse(member.toString()))

    if (applicant.warcraftlogs)
      await sendWarcraftlogsMessage({ guild, settings }, member.toString(), applicant.warcraftlogs)

    await interaction.editReply(`${member.user.tag} has been linked to ${channel.name}.`)
  },
}

export default link
