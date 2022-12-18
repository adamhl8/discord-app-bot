import { Bot } from "discord-bot-shared"
import registerGuildMemberAdd from "./guild-member-add.js"
import registerMessageCreate from "./message-create.js"
import registerMessageReactionAdd from "./message-reaction-add.js"

function addEvents(bot: Bot) {
  bot.events.add(registerGuildMemberAdd)
  bot.events.add(registerMessageCreate)
  bot.events.add(registerMessageReactionAdd)
}

export { addEvents }
