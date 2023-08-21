import { Config, JsonDB } from "node-json-db"

const storage = new JsonDB(new Config("./data/storage", true, true, "/"))

export default storage
