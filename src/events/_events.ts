import type Bot from "discord-bot-shared"

import appCreate from "./app-create.js"
import appReactionAdd from "./app-reaction-add.js"
import applicantJoin from "./applicant-join.js"

/**
 * @param bot The bot
 */
function addEvents(bot: Bot) {
  bot.events.add(applicantJoin)
  bot.events.add(appCreate)
  bot.events.add(appReactionAdd)
}

export default addEvents
