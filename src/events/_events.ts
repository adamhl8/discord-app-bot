import Bot from "discord-bot-shared"
import appCreate from "./app-create.js"
import appReactionAdd from "./app-reaction-add.js"
import applicantJoin from "./applicant-join.js"

function addEvents(bot: Bot) {
  bot.events.add(applicantJoin)
  bot.events.add(appCreate)
  bot.events.add(appReactionAdd)
}

export default addEvents
