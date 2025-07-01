import type { Bot } from "discord-bot-shared"

import { appCreate } from "./app-create.ts"
import { appReactionAdd } from "./app-reaction-add.ts"
import { applicantJoin } from "./applicant-join.ts"

/**
 * @param bot The bot
 */
export function addEvents(bot: Bot) {
  bot.events.add(applicantJoin)
  bot.events.add(appCreate)
  bot.events.add(appReactionAdd)
}
