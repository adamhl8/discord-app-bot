import { JsonDB } from 'node-json-db'
import { Config } from 'node-json-db/dist/lib/JsonDBConfig.js'

const storage = new JsonDB(new Config('storage', true, true, '/'))

export default storage
