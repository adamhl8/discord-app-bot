import { SlashCommandBuilder } from '@discordjs/builders'
import { REST } from '@discordjs/rest'
import { RESTPostAPIApplicationCommandsJSONBody, Routes } from 'discord-api-types/v10'
import { Collection, CommandInteraction } from 'discord.js'
import * as fsp from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

interface CommandImport {
  default: Command
}

interface Command {
  data: SlashCommandBuilder
  run: (interaction: CommandInteraction) => void | Promise<void>
}

const commandsDirectory = fileURLToPath(new URL('commands', import.meta.url))
const commandFiles = await fsp.readdir(commandsDirectory)

const commands = new Collection<string, Command>()
const commandData: RESTPostAPIApplicationCommandsJSONBody[] = []
for (const file of commandFiles) {
  const { default: command } = (await import(`${commandsDirectory}/${file}`)) as CommandImport
  commands.set(command.data.name, command)
  commandData.push(command.data.toJSON())
}

async function registerCommands(botToken: string, clientId: string, guildId: string) {
  const rest = new REST().setToken(botToken)
  try {
    await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commandData })
    console.log('Successfully registered application (/) commands.')
  } catch (error) {
    console.error(error)
  }
}

export default commands
export { Command, registerCommands }
