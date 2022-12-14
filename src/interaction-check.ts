import { throwError } from "discord-bot-shared"
import { ChatInputCommandInteraction } from "discord.js"
import { getSettings } from "./commands/settings.js"
import { getGuildInfo, isModerator } from "./util.js"

async function interactionCheck(interaction: ChatInputCommandInteraction) {
  if (!interaction.guildId) throwError("Unable to get guild ID.")
  const { guild } = await getGuildInfo(interaction.guildId)
  const members = await guild.members
  const member = members.get(interaction.user.id) || throwError("Unable to get member.")
  if (!(await isModerator(member))) throwError("You do not have permission to run this command.")

  const subcommand = interaction.options.getSubcommand(false)
  if (subcommand !== "set" && !(await getSettings(guild.id)))
    throwError("app-bot has not been configured. Please run the '/settings set' command.")

  return true
}

export default interactionCheck
