import type { Guild } from "discord.js"
import {
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  ComponentType,
  ContainerBuilder,
  MessageFlags,
  ModalBuilder,
  SeparatorSpacingSize,
  SlashCommandBuilder,
  StringSelectMenuOptionBuilder,
  TextInputStyle,
} from "discord.js"
import type { Command } from "discord-bot-shared"
import { components } from "discord-bot-shared"
import type { Result } from "ts-explicit-errors"
import { attempt, err, filterMap, isErr } from "ts-explicit-errors"

import type { GuildSettings } from "~/generated/prisma/client.ts"
import { getSettings } from "~/settings/settings-db.ts"

export const settingsCommand: Command = {
  command: new SlashCommandBuilder().setName("settings").setDescription("Configure app-bot."),
  run: async (interaction) => {
    const response = await interaction.deferReply({ flags: [MessageFlags.Ephemeral], withResponse: true })

    const { guild } = interaction

    const settingsContainer = await getSettingsContainer(guild)
    if (isErr(settingsContainer))
      throw new Error(err("failed to get settings container", settingsContainer).messageChain)

    await interaction.editReply({
      components: [settingsContainer],
      flags: [MessageFlags.IsComponentsV2],
    })

    const collector = response.resource?.message?.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 600_000, // 10 minutes
    })

    collector?.on("collect", async (i) => {
      if (i.customId === "doneButton") await interaction.deleteReply()
      else {
        // We need to fetch the updated settings after each modal submission so they can be displayed.
        const newSettings = await getSettings(guild)
        if (isErr(newSettings)) {
          const component = components.error(newSettings.messageChain)
          await interaction.followUp({
            components: component.components,
            flags: [...component.flags, MessageFlags.Ephemeral],
          })
          return
        }

        if (i.customId === "roleSettings") await i.showModal(getRoleSettingsModal(newSettings))
        else if (i.customId === "channelSettings") await i.showModal(getChannelSettingsModal(newSettings))
        else if (i.customId === "messageSettings") await i.showModal(getMessageSettingsModal(newSettings))
        else if (i.customId === "postLogsSettings") await i.showModal(getPostLogsSettingsModal(newSettings))
      }
    })

    collector?.on("end", () => interaction.deleteReply())
  },
}

const getRoleSettingsModal = (settings: Partial<GuildSettings> | null) =>
  new ModalBuilder()
    .setCustomId("roleSettingsModal")
    .setTitle("app-bot Settings")
    .addTextDisplayComponents((t) => t.setContent("## Role Settings"))
    .addLabelComponents(
      (l) =>
        l
          .setLabel("Officer Role(s)")
          .setDescription("Anyone with one of these roles can manage applications.")
          .setRoleSelectMenuComponent((c) =>
            c
              .setCustomId("officerRoles")
              .setMinValues(1)
              .setMaxValues(10)
              .setDefaultRoles(settings?.officerRoleIds?.split(",") ?? []),
          ),
      (l) =>
        l
          .setLabel("Applicant Role")
          .setDescription("The role automatically given to the applicant when they join the server.")
          .setRoleSelectMenuComponent((c) =>
            c.setCustomId("applicantRole").setDefaultRoles(settings?.applicantRoleId ? [settings.applicantRoleId] : []),
          ),
    )

const getChannelSettingsModal = (settings: Partial<GuildSettings> | null) =>
  new ModalBuilder()
    .setCustomId("channelSettingsModal")
    .setTitle("app-bot Settings")
    .addTextDisplayComponents((t) => t.setContent("## Channel Settings"))
    .addLabelComponents(
      (l) =>
        l
          .setLabel("Apps Channel")
          .setDescription("The channel where you have your webhook set up for your form responses.")
          .setChannelSelectMenuComponent((c) =>
            c
              .setCustomId("appsChannel")
              .setChannelTypes(ChannelType.GuildText)
              .setDefaultChannels(settings?.appsChannelId ? [settings.appsChannelId] : []),
          ),
      (l) =>
        l
          .setLabel("Apps Category")
          .setDescription("Applicant channels are created under this category.")
          .setChannelSelectMenuComponent((c) =>
            c
              .setCustomId("appsCategory")
              .setChannelTypes(ChannelType.GuildCategory)
              .setDefaultChannels(settings?.appsCategoryId ? [settings.appsCategoryId] : []),
          ),
    )

const getMessageSettingsModal = (settings: Partial<GuildSettings> | null) =>
  new ModalBuilder()
    .setCustomId("messageSettingsModal")
    .setTitle("app-bot Settings")
    .addTextDisplayComponents((t) => t.setContent("## Message Settings"))
    .addLabelComponents((l) =>
      l
        .setLabel("Decline Message")
        .setDescription("The message sent to applicants when their application is declined.")
        .setTextInputComponent((c) =>
          c
            .setCustomId("declineMessage")
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder("Thank you for your application...")
            .setValue(settings?.declineMessage ?? ""),
        ),
    )

const getPostLogsSettingsModal = (settings: Partial<GuildSettings> | null) =>
  new ModalBuilder()
    .setCustomId("postLogsSettingsModal")
    .setTitle("app-bot Settings")
    .addTextDisplayComponents((t) => t.setContent("## Post Logs Settings"))
    .addLabelComponents(
      (l) =>
        l
          .setLabel("Post Logs?")
          .setDescription("Whether to post logs in the given channel")
          .setStringSelectMenuComponent((c) =>
            c.setCustomId("postLogs").setOptions(
              new StringSelectMenuOptionBuilder()
                .setLabel("True")
                .setValue("true")
                .setDefault(settings?.postLogs === true),
              new StringSelectMenuOptionBuilder()
                .setLabel("False")
                .setValue("false")
                .setDefault(settings?.postLogs === false),
            ),
          ),
      (l) =>
        l
          .setLabel("Post Logs Channel")
          .setDescription("The channel to post logs in")
          .setChannelSelectMenuComponent((c) =>
            c
              .setCustomId("postLogsChannel")
              .setChannelTypes(ChannelType.GuildText)
              .setDefaultChannels(settings?.postLogsChannelId ? [settings.postLogsChannelId] : []),
          ),
    )

export const getSettingsContainer = async (guild: Guild): Promise<Result<ContainerBuilder>> => {
  const settings = await getSettings(guild)
  if (isErr(settings)) return settings

  let currentSettings = ""

  if (settings) {
    const officerRoleIds = settings?.officerRoleIds?.split(",") ?? []

    const { values: officerRoles, errors: officerRoleErrors } = await filterMap(officerRoleIds, async (id) => {
      const officerRole = await attempt(() => guild.roles.fetch(id))
      if (isErr(officerRole)) return err(`failed to fetch officer role with ID '${id}'`, officerRole)
      if (!officerRole) return
      return officerRole
    })
    if (officerRoleErrors)
      return err(
        `failed to fetch all officer roles:\n${officerRoleErrors.map((error) => error.messageChain).join("\n")}`,
        undefined,
      )

    const officerRoleMentions =
      officerRoles.length > 0 ? officerRoles.map((role) => role.toString()).join(", ") : "_Not set_"

    const applicantRoleResult = await attempt(
      async () => settings.applicantRoleId && (await guild.roles.fetch(settings.applicantRoleId))?.toString(),
    )
    if (isErr(applicantRoleResult)) return err("failed to fetch applicant role", applicantRoleResult)
    const applicantRole = applicantRoleResult || "_Not set_"

    const appsChannelResult = await attempt(
      async () => settings.appsChannelId && (await guild.channels.fetch(settings.appsChannelId))?.toString(),
    )
    if (isErr(appsChannelResult)) return err("failed to fetch apps channel", appsChannelResult)
    const appsChannel = appsChannelResult || "_Not set_"

    const appsCategoryResult = await attempt(
      async () => settings.appsCategoryId && (await guild.channels.fetch(settings.appsCategoryId))?.toString(),
    )
    if (isErr(appsCategoryResult)) return err("failed to fetch apps category", appsCategoryResult)
    const appsCategory = appsCategoryResult || "_Not set_"

    const declineMessage = settings.declineMessage ? `\`${settings.declineMessage}\`` : "_Not set_"

    const postLogs = settings.postLogs ? "True" : "False"

    const postLogsChannelResult = await attempt(
      async () => settings.postLogsChannelId && (await guild.channels.fetch(settings.postLogsChannelId))?.toString(),
    )
    if (isErr(postLogsChannelResult)) return err("failed to fetch post logs channel", postLogsChannelResult)
    const postLogsChannel = postLogsChannelResult || "_Not set_"

    currentSettings =
      `**Officer Roles:** ${officerRoleMentions}\n` +
      `**Applicant Role:** ${applicantRole}\n` +
      `**Apps Channel:** ${appsChannel}\n` +
      `**Apps Category:** ${appsCategory}\n` +
      `**Decline Message:** ${declineMessage}\n` +
      `**Post Logs:** ${postLogs}\n` +
      `**Post Logs Channel:** ${postLogsChannel}\n`
  } else currentSettings = "_No settings have been set yet_"

  const settingsContainer = new ContainerBuilder()
    .addTextDisplayComponents((t) => t.setContent(`## Current Settings\n\n${currentSettings}`))
    .addSeparatorComponents((s) => s.setSpacing(SeparatorSpacingSize.Large))
    .addActionRowComponents((a) =>
      a.addComponents(
        new ButtonBuilder().setCustomId("roleSettings").setLabel("Role Settings").setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId("channelSettings").setLabel("Channel Settings").setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId("messageSettings").setLabel("Message Settings").setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId("postLogsSettings")
          .setLabel("Post Logs Settings")
          .setStyle(ButtonStyle.Primary),
      ),
    )
    .addSeparatorComponents((s) => s.setSpacing(SeparatorSpacingSize.Large))
    .addTextDisplayComponents((t) =>
      t.setContent(
        "-# You do not need to click this button to save settings. It only removes this message.\n-# Settings are always saved after closing a modal.",
      ),
    )
    .addActionRowComponents((a) =>
      a.addComponents(new ButtonBuilder().setCustomId("doneButton").setLabel("Done").setStyle(ButtonStyle.Success)),
    )

  return settingsContainer
}
