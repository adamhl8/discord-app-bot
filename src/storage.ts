import { JsonDB } from 'node-json-db'
import { Config } from 'node-json-db/dist/lib/JsonDBConfig.js'

const defaultStorage = new JsonDB(new Config('storage', true, true, '/'))

function get<T>(dataPath: string): T | undefined {
  if (!defaultStorage.exists(dataPath)) return undefined
  return defaultStorage.getObject<T>(dataPath)
}

interface StorageGet {
  get: typeof get
}

const storage: JsonDB & StorageGet = Object.assign({}, defaultStorage, { get })

export default storage
