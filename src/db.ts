import { PrismaLibSql } from "@prisma/adapter-libsql"

import { env } from "#env.ts"
import { PrismaClient } from "#generated/prisma/client.ts"

const adapter = new PrismaLibSql({ url: env.DATABASE_URL })
export const prisma = new PrismaClient({ adapter })
