import { Command, getChannel, getGuildCache, isTextChannel, throwError } from "discord-bot-shared"
import { ChannelType, SlashCommandBuilder, TextChannel } from "discord.js"
import { getApplicant, removeApplicant } from "../applicant.js"
import { getSettings } from "./settings.js"

const deleteApplication: Command = {
  command: new SlashCommandBuilder()
    .setName("delete")
    .setDescription("Delete an application.")
    .addChannelOption((option) =>
      option.setName("channel").setDescription("Select the channel of the application you wish to delete.").setRequired(true),
    )
    .addStringOption((option) => option.setName("reason").setDescription("Provide a reason for deletion.")) as SlashCommandBuilder,
  run: async (interaction) => {
    await interaction.deferReply()

    const channel = interaction.options.getChannel("channel") || throwError("Unable to get channel.")
    if (!isTextChannel(channel)) throwError("Channel is not a text channel.")

    const applicant = (await getApplicant(channel.name)) || throwError(`Unable to get applicant ${channel.name}.`)
    const settings = (await getSettings()) || throwError("Unable to get settings.")

    const { emojis } = (await getGuildCache()) || throwError("Unable to get guild cache.")
    const appsChannel =
      (await getChannel<TextChannel>(settings.appsChannel.id, ChannelType.GuildText)) || throwError("Unable to get Apps channel.")

    const declinedEmoji = emojis.find((emoji) => emoji.name === "declined") || throwError(`Unable to get declined emoji.`)
    const appMessage = (await appsChannel.messages.fetch(applicant.appMessageId)) || throwError(`Unable to get App message.`)
    await appMessage.react(declinedEmoji)

    const reason = interaction.options.getString("reason") || ""

    await channel.delete()
    await removeApplicant(applicant)

    await interaction.editReply(`${channel.name} has been deleted.\n${reason}`)
  },
}

export default deleteApplication
