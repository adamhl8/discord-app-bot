import { getGuildCache, throwError } from 'discord-bot-shared'
import { ChatInputCommandInteraction } from 'discord.js'
import { getSettings } from './commands/settings.js'
import { isModerator } from './util.js'

async function interactionCheck(interaction: ChatInputCommandInteraction) {
  const { members } = (await getGuildCache()) || throwError('Unable to get guild cache.')
  const member = members.get(interaction.user.id) || throwError('Unable to get member.')
  if (!isModerator(member)) throwError('You do not have permission to run this command.')

  const subcommand = interaction.options.getSubcommand(false)
  if (subcommand !== 'set' && !getSettings())
    throwError("app-bot has not been configured. Please run the '/settings set' command.")

  return true
}

export default interactionCheck
