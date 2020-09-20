import { Message } from "discord.js"
import { applicants } from "../app-bot"

export interface Command {
  reqMod: boolean
  run: (msg: Message) => void
}

export const d: Command = {
  reqMod: true,

  run: async (msg) => {
    
    const match = /(!d)\s(\w+)\s(.+)/g.exec(msg.content);

    if (!match) {
      await msg.channel.send("Invalid command.").catch(console.error);
      console.log(`unable to match Discord Tag in message: ${msg}`)
      return
    }

    const name = match[2].toLowerCase();

    if (applicants[name]) {
      
      await applicants[name]
        .channel
        //@ts-ignore
        .send(`<@${applicants[name].member.id}>\n\n${match[3]}\n\nPlease type \`!confirm\` to acknowledge that you have read this message. Upon confirmation your application will be closed and you will be removed from the server.`)
        .catch(console.error);
    } else {
      await msg.channel.send("Invalid command.").catch(console.error);
    }
  }
}

export const confirm: Command = {
  reqMod: false,

  run: async (msg) => {
    //@ts-ignore
    await applicants[msg.channel.name].channel.delete().catch(console.error);
    //@ts-ignore
    await applicants[msg.channel.name].member.kick().catch(console.error);
  }
}