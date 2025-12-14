import type { CommandHook } from "discord-bot-shared"
import { isErr } from "ts-explicit-errors"

import { isModerator } from "~/utils.ts"

export const commandHook: CommandHook = async (interaction) => {
  const member = await interaction.guild.members.fetch({ user: interaction.user.id })
  const isModeratorResult = await isModerator(member)
  if (isErr(isModeratorResult)) throw new Error(isModeratorResult.messageChain)

  if (!isModeratorResult) return { success: false, message: "You do not have permission to run this command." }

  return { success: true }
}
