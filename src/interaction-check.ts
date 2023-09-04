import { throwError, throwUserError } from "discord-bot-shared"
import { ChatInputCommandInteraction } from "discord.js"
import prisma from "./storage.js"
import { isModerator } from "./util.js"

async function interactionCheck(interaction: ChatInputCommandInteraction<"cached">) {
  const members = await interaction.guild.members.fetch()
  const member = members.get(interaction.user.id) ?? throwError(`Failed to get member with ID: ${interaction.user.id}`)
  if (!(await isModerator(member))) throwUserError("You do not have permission to run this command.")

  const subcommand = interaction.options.getSubcommand(false)
  if (subcommand !== "set" && !(await prisma.guildSettings.findUnique({ where: { id: interaction.guild.id } })))
    throwUserError("app-bot has not been configured. Please run the '/settings set' command.")

  return true
}

export default interactionCheck
