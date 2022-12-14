import registerGuildMemberAdd from "./guild-member-add.js"
import registerMessageCreate from "./message-create.js"
import registerMessageReactionAdd from "./message-reaction-add.js"

const events = { registerGuildMemberAdd, registerMessageCreate, registerMessageReactionAdd }

export default events
