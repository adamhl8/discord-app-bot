import type { Bot } from "discord-bot-shared"

import { appCreate } from "~/events/app-create.ts"
import { appReactionAdd } from "~/events/app-reaction-add.ts"
import { applicantJoin } from "~/events/applicant-join.ts"

/**
 * @param bot The bot
 */
export function addEvents(bot: Bot) {
  bot.events.add(applicantJoin)
  bot.events.add(appCreate)
  bot.events.add(appReactionAdd)
}
