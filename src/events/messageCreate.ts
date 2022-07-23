import { getGuildCache, isCategoryChannel, throwError } from 'discord-bot-shared'
import { Message } from 'discord.js'
import { Applicant, parseApplicantName, saveApplicant } from '../applicant.js'
import { getSettings } from '../commands/settings.js'
import bot from '../index.js'

bot.on('messageCreate', (message) => {
  void handleMessageCreate(message).catch(console.error)
})

async function handleMessageCreate(message: Message) {
  const settings = getSettings()
  if (!settings) return

  if (message.channelId !== settings.appsChannel.id) return

  const embed = message.embeds[0] || throwError('Unable to get embed.')
  const fields = embed.fields
  const tag = fields.find((element) => element.name === 'Discord Tag')?.value || throwError('Unable to get tag.')
  const name = parseApplicantName(tag) || throwError('Unable to get name.')

  const { channels } = (await getGuildCache()) || throwError('Unable to get guild cache.')
  const appsCategory = channels.get(settings.appsCategory.id) || throwError('Unable to get Apps category.')
  if (!isCategoryChannel(appsCategory)) throwError('Channel is not a category channel.')

  const channel = (await appsCategory.children.create({ name })) || throwError('Unable to create channel.')
  await channel.send({ embeds: message.embeds })

  const applicant: Applicant = {
    tag,
    name,
    appMessageId: message.id,
    channelId: channel.id,
  }

  saveApplicant(applicant)
}
