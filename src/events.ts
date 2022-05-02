import * as fsp from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

async function registerEvents() {
  const eventsDirectory = fileURLToPath(new URL('events', import.meta.url))
  const eventFiles = await fsp.readdir(eventsDirectory)
  for (const file of eventFiles) {
    await import(`${eventsDirectory}/${file}`)
  }
}

export default registerEvents
