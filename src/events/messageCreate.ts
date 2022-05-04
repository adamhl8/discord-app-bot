import { Applicant, parseApplicantName, saveApplicant } from '../applicant.js'
import { getSettings } from '../commands/settings.js'
import bot from '../index.js'

bot.on('messageCreate', async (message) => {
  const settings = getSettings()
  if (!settings) return

  if (message.channelId !== settings.appsChannel.id) return

  const fields = message.embeds[0].fields
  const tag = fields.find((element) => element.name === 'Discord Tag')?.value
  if (!tag) return console.error('Unable to get tag.')

  const name = parseApplicantName(tag)
  if (!name) return console.error('Unable to get name.')

  if (!message.guild) return console.error(`Unable to get guild.`)
  const appsCategory = await message.guild.channels.fetch(settings.appsCategory.id).catch(console.error)
  if (!appsCategory || appsCategory.type !== 'GUILD_CATEGORY')
    return console.error('Unable to get appsCategory channel.')

  const channel = await appsCategory.createChannel(name).catch(console.error)
  if (!channel) return console.error('Unable to create channel.')
  await channel.send({ embeds: message.embeds })

  const applicant: Applicant = {
    tag,
    name,
    appMessageId: message.id,
    channelId: channel.id,
  }

  saveApplicant(applicant)
})
