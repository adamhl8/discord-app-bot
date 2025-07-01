import type { Bot } from "discord-bot-shared"

import { accept } from "./accept.ts"
import { decline } from "./decline.ts"
import { deleteApplication } from "./delete.ts"
import { link } from "./link.ts"
import { settings } from "./settings.ts"

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
