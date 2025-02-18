# discord-app-bot

A Discord bot for automating the handling of Google Forms pushed to a server. Its primary function is to handle forms that are used for applications where the applicant is either accepted or declined.

Use [Google-Forms-to-Discord-Extended](https://github.com/Kelo/Google-Forms-to-Discord-Extended) to set up sending form responses to your Discord server.

The basic workflow looks like this:

- Someone submits a form response.
- Form is pushed to your Discord server.
- Bot picks this up and a channel for the applicant is automatically created. This channel is where the applicant can see the status of their application.
- Once the applicant joins the server, they are tied to their application.
- The applicant is automatically given an Applicant role. Use this to limit what the applicant can do during while waiting for a response.
- The applicant can either be accepted or declined.
- In either case, the application is closed. On decline the applicant is removed from the server.

See the [Commands](#commands) section for more details.

## Installation/Setup

### Google Form Setup

The only requirement for your Google From is that it has a short answer question with the name/title `Discord Username`. This is used to match applicants who join the server to their application.

It's recommended that you provide an invite link to your server at the end of the form. The applicant should join the server _after_ submitting their application for this bot to work as intended. If the applicant joins early or is not matched to their application correct, you can use the `/link` command to fix this.

### Discord Server Setup

This bot requires that your Discord server is set up in a certain way. You can name the roles/channels whatever you want. See the [Commands](#commands) section for how to set your roles/channels.

The bot needs the following:

- An Officer/Moderator role. Anyone with this role can manage applications through the bot.
- An Applicant role. This is the role automatically given to the applicant when they join the server.
- An Applications channel. This is the channel where you have your webhook set up for your form responses. The bot monitors for applications in this channel.
- An Applicants channel category. Applicant channels are created under this category.

It's intended that you add the Applicant role to the Applicants category's permissions and decline the `View Channels` permission. That way the applicant can only see their own channel (applicants are automatically given permission to view their own channel when they join). You can also decline the `Send Messages` permission if you don't want applicants to be able to send messages in their own channel.

Additionally, you need to upload two custom server emoji:

- One named `approved` and one named `declined`. If an applicant is approved/declined, the emoji is added as a reaction to the application in the apps channel.

While completely optional, it's recommended that you create a separate channel specifically for sending bot commands, as this will serve as a log for processed applications.

### Bot Installation

```
docker run -d \
  --name=discord-app-bot \
  -e BOT_TOKEN=<YOUR_BOT_TOKEN> \
  -e APPLICATION_ID=<YOUR_BOT_APPLICATION_ID> \
  -e DATABASE_URL=file:db/prod.db \
  -v ./data/:/app/prisma/db/ \
  --restart unless-stopped \
  ghcr.io/adamhl8/discord-app-bot:latest
```

- You need to enable the `Server Members` and `Message Content` intents in your bot's settings.

## Commands

Use the following commands to manage the bot and applicants.

`/settings set <officer-role> <applicant-role> <apps-channel> <apps-category> <decline-message> <post-logs>` - The bot won't do anything unless this has been run.

- You can always set `post-logs` to false. This exists as special functionality because this bot was originally created to help with applications to a World of Warcraft guild.

`/settings list` - Prints current settings.

`/accept <applicant-channel>` - Accept an applicant.

`/decline <applicant-channel>` - Decline an applicant.

- Optionally takes:
  - `<decline-message>` - Overwrite the default decline message.
  - `<kick>` - Whether or not the applicant is kicked from the server on decline confirmation.

`/delete <applicant-channel>` - Delete an application.

- Optionally takes:
  - `<reason>` - Provide a reason for the deletion.

`/link <server-member> <applicant-channel>` - Link an applicant to an applicant channel.
