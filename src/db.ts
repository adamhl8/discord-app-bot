import process from "node:process"
import { PrismaLibSql } from "@prisma/adapter-libsql"

import { PrismaClient } from "~/generated/prisma/client.ts"

const adapter = new PrismaLibSql({ url: process.env["DATABASE_URL"] ?? "" })
export const prisma = new PrismaClient({ adapter })
