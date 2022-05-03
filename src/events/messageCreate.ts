import { Applicant, parseApplicantName, saveApplicant } from '../applicant.js'
import { checkSettings, Settings } from '../commands/settings.js'
import bot from '../index.js'
import storage from '../storage.js'

bot.on('messageCreate', async (message) => {
  if (!(await checkSettings())) return
  const settings = storage.getObject<Settings>('/settings')
  if (message.channelId !== settings.appsChannel.id) return

  const fields = message.embeds[0].fields
  let tag

  for (const element of fields) {
    if (element.name === 'Discord Tag') {
      tag = element.value
      break
    }
  }

  if (!tag) throw new Error('tag is undefined')

  const name = parseApplicantName(tag)

  try {
    if (!message.guild) throw new Error(`failed to get guild`)
    const appsCategory = await message.guild.channels.fetch(settings.appsCategory.id)
    if (!appsCategory || appsCategory.type !== 'GUILD_CATEGORY') throw new Error('Unable to get appsCategory channel')
    const channel = await appsCategory.createChannel(name)
    await channel.send({ embeds: message.embeds })

    const applicant: Applicant = {
      tag,
      name,
      appMessageId: message.id,
      channelId: channel.id,
    }
    saveApplicant(applicant)
  } catch {
    throw new Error(`failed to create channel for ${tag}`)
  }
})
