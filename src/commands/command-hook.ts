import type { ChatInputCommandInteraction } from "discord.js"
import { throwUserError } from "discord-bot-shared"

import { getSettings } from "~/settings/settings-db.ts"
import { fetchMemberById, isModerator } from "~/util.ts"

/**
 * @param interaction The interaction that triggered the command
 * @returns Whether the command should continue
 */
export async function commandHook(interaction: ChatInputCommandInteraction<"cached">) {
  const member = await fetchMemberById(interaction.guild, interaction.user.id)
  if (!(await isModerator(member))) throwUserError("You do not have permission to run this command.")

  const subcommand = interaction.options.getSubcommand(false)
  if (subcommand !== "set" && !(await getSettings(interaction.guild.id)))
    throwUserError("app-bot has not been configured. Please run the '/settings set' command.")

  return true
}
