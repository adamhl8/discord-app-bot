import type { Bot } from "discord-bot-shared"

import { accept } from "@/commands/accept.ts"
import { decline } from "@/commands/decline.ts"
import { deleteApplication } from "@/commands/delete.ts"
import { link } from "@/commands/link.ts"
import { settings } from "@/commands/settings.ts"

/**
 * @param bot The bot
 */
export function addCommands(bot: Bot) {
  bot.commands.add(accept)
  bot.commands.add(decline)
  bot.commands.add(deleteApplication)
  bot.commands.add(link)
  bot.commands.add(settings)
}
