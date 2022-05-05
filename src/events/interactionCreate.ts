import commands from '../commands.js'
import { getSettings } from '../commands/settings.js'
import bot from '../index.js'
import { getErrorMessage, isModerator } from '../utils.js'

bot.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return

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

  const command = commands.get(interaction.commandName)
  if (!command) return await interaction.reply(`Unable to get command.`).catch(console.error)

  try {
    await command.run(interaction)
  } catch (error) {
    const errorMessage = getErrorMessage(error)
    await interaction
      .reply({ content: `There was an error while running this command.\n${errorMessage}`, ephemeral: true })
      .catch(console.error)
  }
})
