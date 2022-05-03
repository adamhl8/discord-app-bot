import { Guild } from 'discord.js'
import bot from '../index.js'

let guild: Guild

bot.once('ready', () => {
  const g = bot.guilds.cache.first()
  if (!g) {
    throw new Error('failed to init guild')
  }

  guild = g

  console.log('I am ready!')
})

export { guild }
