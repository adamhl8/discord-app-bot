import Bot from "discord-bot-shared"
import GuildMemberAdd from "./guild-member-add.js"
import MessageCreate from "./message-create.js"
import MessageReactionAdd from "./message-reaction-add.js"

function addEvents(bot: Bot) {
  bot.events.add(GuildMemberAdd)
  bot.events.add(MessageCreate)
  bot.events.add(MessageReactionAdd)
}

export { addEvents }
