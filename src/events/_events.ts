import type { Bot } from "discord-bot-shared"

import { appCreate } from "~/events/app-create.ts"
import { appReactionAdd } from "~/events/app-reaction-add.ts"
import { applicantJoin } from "~/events/applicant-join.ts"
import { settingsModalSubmit } from "~/events/settings-modal-submit.ts"

export function addEvents(bot: Bot) {
  bot.events.add(applicantJoin)
  bot.events.add(appCreate)
  bot.events.add(appReactionAdd)
  bot.events.add(settingsModalSubmit)
}
