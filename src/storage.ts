import { JsonDB } from 'node-json-db'
import { Config } from 'node-json-db/dist/lib/JsonDBConfig.js'

const storage = new JsonDB(new Config('storage', true, true, '/'))

function storageGet<T>(dataPath: string): T | undefined {
  if (!storage.exists(dataPath)) return undefined
  return storage.getObject<T>(dataPath)
}

export default storage
export { storageGet }
