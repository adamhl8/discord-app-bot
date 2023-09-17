import Bot from "discord-bot-shared"
import accept from "./accept.js"
import decline from "./decline.js"
import deleteApplication from "./delete.js"
import link from "./link.js"
import settings from "./settings.js"

function addCommands(bot: Bot) {
  bot.commands.add(accept)
  bot.commands.add(decline)
  bot.commands.add(deleteApplication)
  bot.commands.add(link)
  bot.commands.add(settings)
}

export default addCommands
