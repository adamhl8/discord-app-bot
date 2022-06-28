import { CommandInteraction } from 'discord.js'
import { getSettings } from './commands/settings.js'
import { isModerator } from './utils.js'

async function interactionCheck(interaction: CommandInteraction) {
  if (!interaction.guild) return await interaction.reply(`Unable to get guild.`).catch(console.error)
  const member = await interaction.guild.members.fetch(interaction.user.id).catch(console.error)
  if (!member) return await interaction.reply(`Unable to get member.`).catch(console.error)
  if (!isModerator(member))
    return await interaction
      .reply({ content: 'You do not have permission to run this command.', ephemeral: true })
      .catch(console.error)

  let subcommand = ''
  try {
    subcommand = interaction.options.getSubcommand()
    // eslint-disable-next-line no-empty
  } catch {}
  if (subcommand !== 'set' && !getSettings())
    return await interaction
      .reply({ content: `app-bot has not been configured. Please run the '/settings set' command.`, ephemeral: true })
      .catch(console.error)

  return true
}

export default interactionCheck
