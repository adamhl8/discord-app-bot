import commands from '../commands.js'
import bot from '../index.js'
import { isModerator } from '../utils.js'

bot.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return

  if (!interaction.guild) return await interaction.reply(`Unable to get guild.`)
  const member = await interaction.guild.members.fetch(interaction.user.id).catch(console.error)
  if (!member) return await interaction.reply(`Unable to get member.`)
  if (!(await isModerator(member)))
    return await interaction.reply({ content: 'You do not have permission to run this command.', ephemeral: true })

  const command = commands.get(interaction.commandName)
  if (!command) return

  try {
    await command.run(interaction)
  } catch (error) {
    console.error(error)
    await interaction.reply({ content: 'There was an error while running this command.', ephemeral: true })
  }
})
