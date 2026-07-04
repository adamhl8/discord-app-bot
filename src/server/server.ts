import { once } from "node:events"

import type { ServerType } from "@hono/node-server"
import { serve } from "@hono/node-server"
import type { Client } from "discord.js"
import { Hono } from "hono"
import { bearerAuth } from "hono/bearer-auth"

import { env } from "#/env.ts"
import { apps } from "#/server/apps.ts"

let server: ServerType | undefined

export const startServer = (client: Client) => {
  if (server) return

  const hono = new Hono()
  if (env.APP_BOT_SECRET) hono.use(bearerAuth({ token: env.APP_BOT_SECRET }))

  hono.route("/apps", apps(client))

  server = serve({ fetch: hono.fetch, port: env.PORT }, (info) => {
    console.log(`server listening on port ${info.port}`)
  })
}

export const stopServer = async () => {
  if (!server) return
  const closed = once(server, "close")
  server.close()
  await closed
}
