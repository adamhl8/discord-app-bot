import type { CategoryChannel, Guild, GuildEmoji, TextChannel } from "discord.js"
import { ChannelType } from "discord.js"
import type { Result } from "ts-explicit-errors"
import { attempt, err, isErr } from "ts-explicit-errors"

export async function getGuildTextChannel(guild: Guild, channelId: string): Promise<Result<TextChannel>> {
  const channel = await attempt(() => guild.channels.fetch(channelId))
  if (isErr(channel)) return err("failed to fetch channel", channel)

  if (!channel) return err("channel not found", undefined)

  if (channel.type !== ChannelType.GuildText) return err(`${channel.toString()} is not a text channel`, undefined)

  return channel
}

export async function getGuildCategory(guild: Guild, categoryId: string): Promise<Result<CategoryChannel>> {
  const category = await attempt(() => guild.channels.fetch(categoryId))
  if (isErr(category)) return err("failed to fetch category", category)

  if (!category) return err("category not found", undefined)

  if (category.type !== ChannelType.GuildCategory) return err(`${category.toString()} is not a category`, undefined)

  return category
}

export async function getGuildEmoji(guild: Guild, emojiName: string): Promise<Result<GuildEmoji>> {
  const emojis = await attempt(() => guild.emojis.fetch())
  if (isErr(emojis)) return err("failed to fetch emojis", emojis)

  const emoji = emojis.find((e) => e.name === emojiName)
  if (!emoji) return err(`failed to find emoji with name '${emojiName}'`, undefined)

  return emoji
}
