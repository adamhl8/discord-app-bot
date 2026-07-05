import "node_modules/@adamhl8/configs/dist/configs/justfile.base.just"

bump-deps: _bump-deps
    prisma generate

build: _build
    oxfmt apps-script/on-submit.js

db-generate:
    prisma generate

db-migrate:
    prisma migrate dev

db-studio:
    prisma studio
