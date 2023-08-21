import { Command, throwError } from "discord-bot-shared"
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js"
import storage from "../storage.js"

const settings: Command = {
  command: new SlashCommandBuilder()
    .setName("settings")
    .setDescription("Configure app-bot.")
    .addSubcommand((subcommand) => subcommand.setName("list").setDescription("List current settings."))
    .addSubcommand((subcommand) =>
      subcommand
        .setName("set")
        .setDescription("Set all app-bot settings.")
        .addRoleOption((option) =>
          option
            .setName("officer-role")
            .setDescription("Members must have this role to interact with app-bot.")
            .setRequired(true),
        )
        .addRoleOption((option) =>
          option.setName("applicant-role").setDescription("The role given to each applicant.").setRequired(true),
        )
        .addChannelOption((option) =>
          option.setName("apps-channel").setDescription("The channel where applications are posted.").setRequired(true),
        )
        .addChannelOption((option) =>
          option
            .setName("apps-category")
            .setDescription("The channel category where applicant channels will be created.")
            .setRequired(true),
        )
        .addStringOption((option) =>
          option
            .setName("decline-message")
            .setDescription("The message sent to the applicant upon using the /decline command.")
            .setRequired(true),
        )
        .addBooleanOption((option) =>
          option
            .setName("post-logs")
            .setDescription("If the applicant's Warcraft Logs should be posted (to members-channel).")
            .setRequired(true),
        )
        .addChannelOption((option) =>
          option
            .setName("post-logs-channel")
            .setDescription("The channel where the applicant's Warcraft Logs will be posted."),
        ),
    )
    .toJSON(),
  run: async (_, interaction) => {
    const subcommand = interaction.options.getSubcommand()
    if (subcommand === "list") await listSettings(interaction)
    if (subcommand === "set") await setSettings(interaction)
  },
}

interface Setting {
  name: string
  id: string
}

export interface Settings {
  officerRole: Setting
  applicantRole: Setting
  appsChannel: Setting
  appsCategory: Setting
  declineMessage: string
  postLogs: boolean
  postLogsChannel: Setting | undefined
}

async function listSettings(interaction: ChatInputCommandInteraction) {
  const guildId = interaction.guildId
  if (!guildId) throwError("Unable to get guild ID.")
  const settings = await getSettings(guildId)

  const postLogsChannel = settings.postLogsChannel ? settings.postLogsChannel.name : "Not set"

  const currentSettings =
    "Current Settings:" +
    "```\n" +
    `Officer Role: ${settings.officerRole.name}\n` +
    `Applicant Role: ${settings.applicantRole.name}\n` +
    `Apps Channel: ${settings.appsChannel.name}\n` +
    `Apps Category: ${settings.appsCategory.name}\n` +
    `Decline Message: ${settings.declineMessage}\n` +
    `Post Logs: ${settings.postLogs ? "True" : "False"}\n` +
    `Post Logs Channel: ${postLogsChannel}\n` +
    "```"

  await interaction.reply(currentSettings)
}

async function setSettings(interaction: ChatInputCommandInteraction) {
  const channelNameError = "Unable to get channel name"

  const officerRoleData = interaction.options.getRole("officer-role") ?? throwError("Unable to get officer-role.")
  const officerRole: Setting = {
    name: officerRoleData.name,
    id: officerRoleData.id,
  }

  const applicantRoleData = interaction.options.getRole("applicant-role") ?? throwError("Unable to get applicant-role.")
  const applicantRole: Setting = {
    name: applicantRoleData.name,
    id: applicantRoleData.id,
  }

  const appsChannelData = interaction.options.getChannel("apps-channel") ?? throwError("Unable to get apps-channel.")
  const appsChannel: Setting = {
    name: appsChannelData.name ?? channelNameError,
    id: appsChannelData.id,
  }

  const appsCategoryData = interaction.options.getChannel("apps-category") ?? throwError("Unable to get apps-category.")
  const appsCategory: Setting = {
    name: appsCategoryData.name ?? channelNameError,
    id: appsCategoryData.id,
  }

  const declineMessageData =
    interaction.options.getString("decline-message") ?? throwError("Unable to get decline-message.")
  const declineMessage = declineMessageData

  const postLogsData = interaction.options.getBoolean("post-logs") ?? throwError("Unable to get post-logs.")
  const postLogs = postLogsData

  const postLogsChannelData = interaction.options.getChannel("post-logs-channel")
  const postLogsChannel = postLogsChannelData
    ? {
        name: postLogsChannelData.name ?? channelNameError,
        id: postLogsChannelData.id,
      }
    : undefined

  const settings: Settings = {
    officerRole,
    applicantRole,
    appsChannel,
    appsCategory,
    declineMessage,
    postLogs,
    postLogsChannel,
  }

  const guildId = interaction.guildId
  if (!guildId) throwError("Unable to get guild ID.")

  await storage.push(`/${guildId}/settings`, settings)

  await listSettings(interaction)
}

async function getSettings(guildId: string) {
  return await storage.getObject<Settings>(`/${guildId}/settings`)
}

async function isSettingsSet(guildId: string) {
  return await storage.exists(`/${guildId}/settings`)
}

export default settings
export { getSettings, isSettingsSet }
