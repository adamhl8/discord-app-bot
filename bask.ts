import { task } from "@adamhl8/bask"
import { bumpDeps } from "@adamhl8/configs/bask"

export * from "@adamhl8/configs/bask"

export const dbGenerate = task(async ({ sh }) => {
  await sh`prisma generate`
})

export const dbMigrate = task(async ({ sh }) => {
  await sh`prisma migrate dev`
})

export const dbStudio = task(async ({ sh }) => {
  await sh`prisma studio`
})

bumpDeps.after(dbGenerate)
