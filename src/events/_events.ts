import type { Bot } from "discord-bot-shared"

import { applicantJoin } from "#events/applicant-join.ts"
import { declineConfirm } from "#events/decline-confirm.ts"
import { settingsModalSubmit } from "#events/settings-modal-submit.ts"

export const addEvents = (bot: Bot) => {
  bot.events.add(applicantJoin)
  bot.events.add(declineConfirm)
  bot.events.add(settingsModalSubmit)
}
