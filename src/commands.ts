import { SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder } from '@discordjs/builders'
import { REST } from '@discordjs/rest'
import { RESTPostAPIApplicationCommandsJSONBody, Routes } from 'discord-api-types/v10'
import { Collection, CommandInteraction } from 'discord.js'
import { readdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

interface CommandImport {
  default: Command
}

interface Command {
  command:
    | SlashCommandBuilder
    | SlashCommandSubcommandsOnlyBuilder
    | Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>
  run: (interaction: CommandInteraction) => void | Promise<void>
}

const commandsDirectory = fileURLToPath(new URL('commands', import.meta.url))
const commandFiles = await readdir(commandsDirectory)

const commands = new Collection<string, Command>()
const commandData: RESTPostAPIApplicationCommandsJSONBody[] = []
for (const file of commandFiles) {
  const { default: command } = (await import(`${commandsDirectory}/${file}`)) as CommandImport
  commands.set(command.command.name, command)
  commandData.push(command.command.toJSON())
}

async function registerCommands(botToken: string, clientId: string, guildId?: string) {
  const rest = new REST().setToken(botToken)
  if (guildId)
    await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commandData }).catch(console.error)
  else rest.put(Routes.applicationCommands(clientId), { body: commandData }).catch(console.error)
  console.log('Registered application (/) commands.')
}

export default commands
export { Command, registerCommands }
