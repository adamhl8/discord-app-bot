import { Collection, Role, Snowflake, GuildMember, DMChannel } from "discord.js"
import ObjectCache from "./ObjectCache"

// set up global error handlers
process.on("unhandledRejection", (error) => {
  console.log("unhandledRejection: ", error)
})

export function welcomeNewMember(member: GuildMember) {
  const welcomeMessage =
    member.displayName +
    ", welcome to **Skyhold**! Please go over the server rules in #welcome. Before asking a question, go over all of the available guides and resources in #guides-resources-faq; many frequently asked questions are answered there. Remember to check the Pinned Messages in each text channel for additional information. You can do so by clicking the Pin icon at the top right of your Discord window: <http://i.imgur.com/TuYQkjJ.png>. If you're unable to find an answer to your question or if you need clarification on something, please ask! That's what we're here for. :smile: We hope you enjoy your time in Skyhold!"

  member
    .createDM()
    .then((channel: DMChannel) => {
      channel
        .send(welcomeMessage)
        .then(() => console.log("Sent welcome message to " + member.user.tag))
        .catch(console.error)
    })
    .catch(console.error)
}

export function isMod(member: GuildMember, roleCache: ObjectCache<Role>) {
  const roles = member.roles.cache
  return roles.has(roleCache.getOrThrow("Val'kyr (Mod)").id)
}

export function collectionToCacheByName<T extends { name: string }>(
  collection: Collection<Snowflake, T>
): ObjectCache<T> {
  const entries = collection.entries()
  const byName: Array<[string, T]> = Array.from(entries).map(([, item]) => [item.name, item])

  return new ObjectCache(byName)
}
