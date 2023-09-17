import { throwUserError } from "discord-bot-shared"
import { ChatInputCommandInteraction } from "discord.js"
import { getSettings } from "../settings/settings-db.js"
import { fetchMemberById, isModerator } from "../util.js"

async function commandHook(interaction: ChatInputCommandInteraction<"cached">) {
  const member = await fetchMemberById(interaction.guild, interaction.user.id)
  if (!(await isModerator(member))) throwUserError("You do not have permission to run this command.")

  const subcommand = interaction.options.getSubcommand(false)
  if (subcommand !== "set" && !(await getSettings(interaction.guild.id)))
    throwUserError("app-bot has not been configured. Please run the '/settings set' command.")

  return true
}

export default commandHook
