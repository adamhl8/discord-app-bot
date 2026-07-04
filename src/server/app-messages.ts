import { ContainerBuilder, MessageFlags, SeparatorSpacingSize } from "discord.js"

interface ApplicationField {
  name: string
  value: string
}

interface ApplicationMessageContent {
  heading: string
  texts: string[]
}

// display component limits: 4000 characters of text and 40 components per message,
// where the container, heading, and separator leave 37 slots for answer text displays
const MESSAGE_TEXT_LIMIT = 4000
const MESSAGE_ANSWER_LIMIT = 37

const truncate = (text: string, max: number) => (text.length > max ? `${text.slice(0, max - 1)}…` : text)

const packAppMessages = (title: string, fields: ApplicationField[]): ApplicationMessageContent[] => {
  const heading = `## ${truncate(title, 256)}`
  const messages: ApplicationMessageContent[] = []
  let current: ApplicationMessageContent = { heading, texts: [] }
  let chars = heading.length

  const rollover = () => {
    messages.push(current)
    current = { heading: `${heading} (cont.)`, texts: [] }
    chars = current.heading.length
  }

  for (const field of fields) {
    const name = truncate(field.name, 256)
    let label = `**${name}**\n`
    let remaining = field.value.trim() ? field.value : "*no response*"

    while (remaining) {
      const available = MESSAGE_TEXT_LIMIT - chars - label.length
      if (available < 1 || current.texts.length >= MESSAGE_ANSWER_LIMIT) {
        rollover()
        continue
      }

      const piece = remaining.slice(0, available)
      current.texts.push(`${label}${piece}`)
      chars += label.length + piece.length
      remaining = remaining.slice(piece.length)
      label = `**${name} (cont.)**\n`
    }
  }

  messages.push(current)
  return messages
}

export const buildAppMessages = (title: string, fields: ApplicationField[]) =>
  packAppMessages(title, fields).map(({ heading, texts }) => {
    const container = new ContainerBuilder()
      .setAccentColor(0x00_80_ff)
      .addTextDisplayComponents((textDisplay) => textDisplay.setContent(heading))
      .addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Small))

    for (const text of texts) container.addTextDisplayComponents((textDisplay) => textDisplay.setContent(text))

    return { components: [container], flags: [MessageFlags.IsComponentsV2] as const }
  })
