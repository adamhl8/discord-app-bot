# discord.js v15 migration

## Context

The app is migrating to discord.js v15 (a pre-release major). `discord-bot-shared@1.0.0` is already migrated and installed: its `Command.command` type is `ChatInputCommandBuilder`, its `Event` type is built on `ClientEventTypes`, and it peers on `discord.js ^15.0.0`.

However, the app's package.json currently pins `discord.js: ^14.26.4` (the earlier v15 pin was reverted by the dep update that brought in shared 1.0.0), so 14.26.4 is what's installed. The v15 target is the dev build published from discord.js main: `15.0.0-pr-11006.1765452229-e636950b2` (the same build shared 1.0.0 uses as its devDependency).

Every API this app uses was verified against the actual v15 typings (discord.js tarball plus its `@discordjs/builders@2.0.0-pr-11006...`). The app is already on modern idioms (no `ephemeral: true`, no `fetchReply`, uses `withResponse` + `response.resource?.message`, `Events.ClientReady`, Components V2), so the official migration guide's renames mostly don't apply. What does apply: the builders v2 rewrite (not covered by the guide) and `RoleManager#fetch()` now throwing for missing roles.

## Changes

### 1. Re-bump and install discord.js v15

- package.json: `"discord.js": "^14.26.4"` -> `"discord.js": "^15.0.0-pr-11006.1765452229-e636950b2"`
- `nub i` to update lock.yaml and node_modules (verify `node_modules/discord.js/package.json` reports 15.x and the lock resolves `discord-bot-shared@1.0.0(discord.js@15...)`)

### 2. Slash commands: `SlashCommandBuilder` -> `ChatInputCommandBuilder`, singular option adders -> plural

v15 removed `SlashCommandBuilder` entirely. Replacement verified: `ChatInputCommandBuilder` with `setName`/`setDescription` intact, and plural adders `addChannelOptions` / `addStringOptions` / `addBooleanOptions` / `addUserOptions` (same callback shape, option builders keep `setName`/`setDescription`/`setRequired`). This also matches the installed shared lib's `Command` type exactly.

Files: `src/commands/accept.ts`, `decline.ts`, `link.ts`, `delete.ts`, `settings.ts` (settings uses the bare builder, so only the class rename there).

```ts
// before
new SlashCommandBuilder().setName("accept")...
  .addChannelOption((option) => option.setName("channel")...)
// after
new ChatInputCommandBuilder().setName("accept")...
  .addChannelOptions((option) => option.setName("channel")...)
```

### 3. Buttons: per-style classes replace `ButtonBuilder` + `setStyle()`

In v15 `ButtonBuilder` is only a union type. Concrete classes verified: `PrimaryButtonBuilder`, `SecondaryButtonBuilder`, `SuccessButtonBuilder`, `DangerButtonBuilder`, `LinkButtonBuilder`, `PremiumButtonBuilder` (all have `setCustomId`, `setLabel`, `setDisabled`). `ActionRowBuilder` is no longer generic.

- `src/commands/decline.ts:49-53`:
  ```ts
  // before
  new ButtonBuilder().setCustomId("declineConfirm").setLabel("Confirm").setStyle(ButtonStyle.Primary)
  new ActionRowBuilder<ButtonBuilder>().addComponents(declineConfirmButton)
  // after
  new PrimaryButtonBuilder().setCustomId("declineConfirm").setLabel("Confirm")
  new ActionRowBuilder().addComponents(declineConfirmButton)
  ```
- `src/commands/settings.ts:204-223`: the 4 `ButtonStyle.Primary` buttons -> `new PrimaryButtonBuilder()`, the Done button (`ButtonStyle.Success`) -> `new SuccessButtonBuilder()`.
- Drop now-unused `ButtonStyle` (both files) and adjust `ButtonBuilder` imports.

### 4. `guild.roles.fetch(id)` now throws for missing roles

v15 typing is `fetch(id): Promise<Role>` - a deleted/unknown role rejects instead of resolving `null`. Keep calling `fetch` directly inside the existing `attempt()` wrappers and rely on the normal `isErr` check: the error IS the missing-role signal. No helper. The null-handling branches become dead code and are removed:

- `src/settings/settings-db.ts:74`: remove `if (!role) return` in the officer-roles filterMap (a missing role now errors via `isErr` instead of being skipped)
- `src/settings/settings-db.ts:87`: remove the `if (!applicantRole) return err("failed to find applicant role...")` branch (the `isErr` branch above it now covers missing)
- `src/commands/settings.ts:142`: remove `if (!officerRole) return` in the settings-display filterMap
- `src/commands/settings.ts:155-159`: no structural change - `applicantRole?.toString()` can become `applicantRole.toString()` since fetch never resolves null, and the `?? "_Not set_"` stays (it covers the unset `applicantRoleId` early-return, which resolves undefined)

Accepted behavior change: a role that was deleted from the guild now surfaces as a fetch error (command fails with "failed to fetch ...") instead of being silently skipped or shown as "_Not set_".

### No changes needed (verified against v15 typings)

- Modal/Label API in `settings.ts` (`addLabelComponents`, `addTextDisplayComponents`, `setRoleSelectMenuComponent`, `setChannelSelectMenuComponent`, `setStringSelectMenuComponent`, `setTextInputComponent`, `setDefaultRoles`/`setDefaultChannels`/`setChannelTypes`) - all present
- `ModalSubmitFields` accessors in `events/settings-modal-submit.ts` (`getSelectedRoles`, `getSelectedChannels`, `getStringSelectValues`, `getTextInputValue`) - all present
- `deferReply({ flags: [MessageFlags.Ephemeral], withResponse: true })` -> `response.resource?.message?.createMessageComponentCollector(...)` - already the v15 shape
- ContainerBuilder V2 surface (`setAccentColor`, `addActionRowComponents`, `addSeparatorComponents`, `SeparatorSpacingSize`) in `settings.ts`, `applicant/applicant-service.ts`, `server/app-messages.ts`
- `interaction.options.getChannel(name, true, [ChannelType.GuildText])` typed overload, `getString`/`getBoolean`/`getUser`
- `index.ts` (`Events.ClientReady`, `GatewayIntentBits`, `bot.events.add` shape matches shared 1.0.0), `StringSelectMenuOptionBuilder` (`setLabel`/`setValue`/`setDefault`), `ButtonInteraction`, `User#tag`, `permissionOverwrites.create`, `appsCategory.children.create`, `guild.channels.fetch` null-handling (unchanged), `interaction.update`/`isFromMessage`/`isButton`

## Verification

1. After the re-bump, `nub i` and confirm discord.js 15.x is installed
2. `nub exec tsc --noEmit` (no typecheck recipe in the justfile, tsc is a devDep) - expect clean
3. `just lint` (oxlint + tsgolint type-aware rules, oxfmt, knip - knip should confirm the dropped `ButtonStyle` imports)
4. Smoke test: `nub --env-file .env ./src/index.ts` - verify login, clientReady fires (server starts), and guild command registration succeeds with the `ChatInputCommandBuilder` JSON (`REGISTER_GUILD_COMMANDS` env triggers guild registration)
