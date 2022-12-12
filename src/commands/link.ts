import { Command, getGuildCache, isTextChannel, throwError } from "discord-bot-shared"
import { SlashCommandBuilder } from "discord.js"
import { appResponse, getApplicant, saveApplicant } from "../applicant.js"
import { sendWarcraftlogsEmbed } from "../util.js"
import { getSettings } from "./settings.js"

const link: Command = {
  command: new SlashCommandBuilder()
    .setName("link")
    .setDescription("Link an applicant.")
    .addChannelOption((option) =>
      option.setName("channel").setDescription("Select the channel that the applicant will be linked to.").setRequired(true),
    )
    .addUserOption((option) =>
      option.setName("applicant").setDescription("The applicant to be linked to the selected channel.").setRequired(true),
    ) as SlashCommandBuilder,
  run: async (interaction) => {
    if (!interaction.guildId) throwError("Unable to get guild ID.")

    await interaction.deferReply()

    const channel = interaction.options.getChannel("channel") || throwError("Unable to get channel.")
    if (!isTextChannel(channel)) throwError("Channel is not a text channel.")

    const applicant = (await getApplicant(channel.name, interaction.guildId)) || throwError(`Unable to get applicant ${channel.name}.`)
    const user = interaction.options.getUser("applicant") || throwError(`Unable to get user.`)

    const { members } = (await getGuildCache(interaction.guildId)) || throwError("Unable to get guild cache.")
    const member = members.get(user.id) || throwError(`Unable to get member.`)

    applicant.memberId = member.id
    applicant.tag = member.user.tag
    await saveApplicant(applicant, interaction.guildId)

    const settings = (await getSettings(interaction.guildId)) || throwError("Unable to get settings.")

    await member.roles.add(settings.applicantRole.id)
    await channel.permissionOverwrites.create(member.user, { ViewChannel: true })
    await channel.send(appResponse(member.toString()))

    if (applicant.warcraftlogs) await sendWarcraftlogsEmbed(member, applicant.warcraftlogs)

    await interaction.editReply(`${member.user.tag} has been linked to ${channel.name}.`)
  },
}

export default link
