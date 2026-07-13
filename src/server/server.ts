import bun from "bun"
import type { Server } from "bun"
import type { Client } from "discord.js"
import { Hono } from "hono"
import { bearerAuth } from "hono/bearer-auth"

import { env } from "#env.ts"
import { apps } from "#server/apps.ts"

let server: Server<undefined> | undefined

export const startServer = (client: Client) => {
  if (server) return

  const hono = new Hono()
  if (env.APP_BOT_SECRET) hono.use(bearerAuth({ token: env.APP_BOT_SECRET }))

  hono.route("/apps", apps(client))

  server = bun.serve({ fetch: hono.fetch, port: env.PORT })
  console.log(`server listening on port ${server.port}`)
}

export const stopServer = async () => {
  if (!server) return
  await server.stop()
  server = undefined
}
