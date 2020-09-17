import Discord, { Message } from "discord.js"

export interface Command {
  reqMod: boolean
  run: (msg: Message) => void
}

export const r: Command = {
  reqMod: true,

  run: (msg) => {},
}
