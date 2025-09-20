import type { GuildSettings } from "@prisma/client"
import type { ChatInputCommandInteraction } from "discord.js"

import { getSettingsOrThrow, saveSettings } from "~/settings/settings-db.ts"

/**
 * @param interaction The interaction that triggered the command
 */
async function listSettings(interaction: ChatInputCommandInteraction<"cached">) {
  const guild = interaction.guild
  const settings = await getSettingsOrThrow(guild.id)

  const officerRole = await guild.roles.fetch(settings.officerRoleId)
  const applicantRole = await guild.roles.fetch(settings.applicantRoleId)
  const appsChannel = await guild.channels.fetch(settings.appsChannelId)
  const appsCategory = await guild.channels.fetch(settings.appsCategoryId)
  const postLogsChannel = settings.postLogsChannelId && (await guild.channels.fetch(settings.postLogsChannelId))
  const postLogsChannelName = postLogsChannel ? postLogsChannel.name : "Not set"

  const currentSettings =
    "Current Settings:" +
    "```\n" +
    `Officer Role: ${officerRole?.name ?? "Not found"}\n` +
    `Applicant Role: ${applicantRole?.name ?? "Not found"}\n` +
    `Apps Channel: ${appsChannel?.name ?? "Not found"}\n` +
    `Apps Category: ${appsCategory?.name ?? "Not found"}\n` +
    `Decline Message: ${settings.declineMessage}\n` +
    `Post Logs: ${settings.postLogs ? "True" : "False"}\n` +
    `Post Logs Channel: ${postLogsChannelName}\n` +
    "```"

  await interaction.reply(currentSettings)
}

/**
 * @param interaction The interaction that triggered the command
 */
async function setSettings(interaction: ChatInputCommandInteraction<"cached">) {
  const officerRoleId = interaction.options.getRole("officer-role", true).id
  const applicantRoleId = interaction.options.getRole("applicant-role", true).id
  const appsChannelId = interaction.options.getChannel("apps-channel", true).id
  const appsCategoryId = interaction.options.getChannel("apps-category", true).id
  const declineMessage = interaction.options.getString("decline-message", true)
  const postLogs = interaction.options.getBoolean("post-logs", true)
  // eslint-disable-next-line unicorn/no-null
  const postLogsChannelId = interaction.options.getChannel("post-logs-channel")?.id ?? null

  const settings: GuildSettings = {
    id: interaction.guild.id,
    officerRoleId,
    applicantRoleId,
    appsChannelId,
    appsCategoryId,
    declineMessage,
    postLogs,
    postLogsChannelId,
  }

  await saveSettings(settings)
  await listSettings(interaction)
}

export { listSettings, setSettings }
