import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction } from 'discord.js'
import { Command } from '../commands.js'
import storage from '../storage.js'

const settings: Command = {
  command: new SlashCommandBuilder()
    .setName('settings')
    .setDescription('Configure app-bot.')
    .addSubcommand((subcommand) => subcommand.setName('list').setDescription('List current settings.'))
    .addSubcommand((subcommand) =>
      subcommand
        .setName('set')
        .setDescription('Set all app-bot settings.')
        .addRoleOption((option) =>
          option
            .setName('officer-role')
            .setDescription('Members must have this role to interact with app-bot.')
            .setRequired(true),
        )
        .addRoleOption((option) =>
          option.setName('applicant-role').setDescription('The role given to each applicant.').setRequired(true),
        )
        .addChannelOption((option) =>
          option.setName('apps-channel').setDescription('The channel where applications are posted.').setRequired(true),
        )
        .addChannelOption((option) =>
          option
            .setName('apps-category')
            .setDescription('The channel category where applicant channels will be created.')
            .setRequired(true),
        )
        .addStringOption((option) =>
          option
            .setName('decline-message')
            .setDescription('The message sent to the applicant upon using the /decline command.')
            .setRequired(true),
        ),
    ),
  run: async (interaction: CommandInteraction) => {
    const subcommand = interaction.options.getSubcommand()
    if (subcommand === 'list') await listSettings(interaction)
    if (subcommand === 'set') await setSettings(interaction)
  },
}

interface Setting {
  name: string
  id: string
}

interface Settings {
  officerRole: Setting
  applicantRole: Setting
  appsChannel: Setting
  appsCategory: Setting
  declineMessage: string
}

async function listSettings(interaction: CommandInteraction) {
  const settings = getSettings()
  if (!settings) return await interaction.reply('Unable to get settings.').catch(console.error)

  const currentSettings =
    'Current Settings:' +
    '```\n' +
    `Officer Role: ${settings.officerRole.name}\n` +
    `Applicant Role: ${settings.applicantRole.name}\n` +
    `Apps Channel: ${settings.appsChannel.name}\n` +
    `Apps Category: ${settings.appsCategory.name}\n` +
    `Decline Message: ${settings.declineMessage}\n` +
    '```'

  await interaction.reply(currentSettings).catch(console.error)
}

async function setSettings(interaction: CommandInteraction) {
  const officerRoleData = interaction.options.getRole('officer-role')
  if (!officerRoleData) return await interaction.reply('Unable to get officer-role.').catch(console.error)
  const officerRole: Setting = {
    name: officerRoleData.name,
    id: officerRoleData.id,
  }

  const applicantRoleData = interaction.options.getRole('applicant-role')
  if (!applicantRoleData) return await interaction.reply('Unable to get applicant-role.').catch(console.error)
  const applicantRole: Setting = {
    name: applicantRoleData.name,
    id: applicantRoleData.id,
  }

  const appsChannelData = interaction.options.getChannel('apps-channel')
  if (!appsChannelData) return await interaction.reply('Unable to get apps-channel.').catch(console.error)
  const appsChannel: Setting = {
    name: appsChannelData.name,
    id: appsChannelData.id,
  }

  const appsCategoryData = interaction.options.getChannel('apps-category')
  if (!appsCategoryData) return await interaction.reply('Unable to get apps-category.').catch(console.error)
  const appsCategory: Setting = {
    name: appsCategoryData.name,
    id: appsCategoryData.id,
  }

  const declineMessageData = interaction.options.getString('decline-message')
  if (!declineMessageData) return await interaction.reply('Unable to get decline-message.').catch(console.error)
  const declineMessage = declineMessageData

  const settings: Settings = {
    officerRole,
    applicantRole,
    appsChannel,
    appsCategory,
    declineMessage,
  }

  storage.push('/settings', settings)

  await listSettings(interaction)
}

function getSettings() {
  return storage.get<Settings>('/settings')
}

export default settings
export { getSettings }
