import "node_modules/@adamhl8/configs/dist/configs/justfile.base.just"

bump-deps: _bump-deps
    prisma generate

db-generate:
    prisma generate

db-migrate:
    prisma migrate dev

db-studio:
    prisma studio
