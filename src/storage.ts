import { Config, JsonDB } from "node-json-db"

const storage = new JsonDB(new Config("./data/storage", true, true, "/"))

async function storageGet<T>(dataPath: string): Promise<T | undefined> {
  if (!(await storage.exists(dataPath))) return undefined
  return await storage.getObject<T>(dataPath)
}

export default storage
export { storageGet }
