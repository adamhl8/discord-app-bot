import { throwError } from "discord-bot-shared"
import { ChatInputCommandInteraction } from "discord.js"
import { getSettings } from "./settings-db.js"

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

export { listSettings, setSettings }
