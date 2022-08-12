import { JsonDB } from 'node-json-db'
import { Config } from 'node-json-db/dist/lib/JsonDBConfig.js'

const storage = new JsonDB(new Config('storage', true, true, '/'))

async function storageGet<T>(dataPath: string): Promise<T | undefined> {
  if (!(await storage.exists(dataPath))) return undefined
  return await storage.getObject<T>(dataPath)
}

export default storage
export { storageGet }
