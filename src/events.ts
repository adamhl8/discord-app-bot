import { readdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

async function registerEvents() {
  const eventsDirectory = fileURLToPath(new URL('events', import.meta.url))
  const eventFiles = await readdir(eventsDirectory)
  for (const file of eventFiles) {
    await import(`${eventsDirectory}/${file}`)
  }
}

export default registerEvents
