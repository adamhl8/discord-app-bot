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

See the Commands section for more details.

## Installation/Setup

### Google Form Setup

The only requirement for your Google From is that it has a short answer question with the name/title `Discord Tag`. Applicants must enter their Discord Tag in the correct format. e.g. User#1234

It's recommended that you provide an invite link to your server at the end of the form. The applicant must join the server _after_ submitting their application for this bot to work as intended.

### Discord Server Setup

This bot requires that your Discord server is set up in a certain way. You can name the roles/channels whatever you want. See the Commands section on how to set your roles/channels if you're not using the default names.

By default the bot looks for the following:

- A role named `Officer`. Anyone with this role can manage applications through the bot.
- A role named `Applicant`. This is the role automatically given to the applicant when they join the server.
- A channel named `Apps`. This is the channel where you have your webhook set up for your form responses. The bot monitors for applications in this channel.
- A category named `Applicants`. Applicant channels are created under this category.

It's intended that you add the Applicant role to the Applicants category's permissions and decline the `View Channels` permission. That way the applicant can only see their own channel (applicants are automatically given permission to view their own channel when they join). You can also decline the `Send Messages` permission if you don't want applicants to be able to send messages in their own channel.

Additionally, you need to upload two custom server emoji:

- One named `approved` and one named `declined`. If an applicant is approved/declined, the emoji is added as a reaction to the application in the apps channel.

While completely optional, it's recommended that you create a separate channel specifically for sending bot commands.

### Bot Installation

1. Install prerequisites.
   - [pm2](https://github.com/Unitech/pm2) is used to handle running the Node process.

```
npm install -g pm2
```

2. Clone the repo.

```
git clone https://github.com/adamhl8/discord-app-bot.git
```

3. Install dependencies.

```
npm install
```

4. Create a [Discord Developer Application](https://discord.com/developers/applications) for your bot.

   - Make sure to turn on Server Members Intent in the Bot menu.

5. Add the bot to your server using this link: `https://discord.com/api/oauth2/authorize?client_id=APP_ID&permissions=8&scope=bot`

   - Replace "APP_ID" in the URL with your bot's Application ID (General Information menu).

6. Create a file named `.env` in the root of the project directory and paste your bot's token (found in the Bot menu) in the file like this:

```
TOKEN=yourtokenhere
```

7. Start the bot.

```
npm start
```

## Commands

Use the following commands to manage the bot and applicants.

### Administrator Commands

You must have Administrator permissions in the server to run these commands.

`!init` - Prints current settings and command info.

Use the following commands to override the default settings:
`!officerRole roleName`
`!applicantRole roleName`
`!appsChannel channelName`
`!applicantsCategory categoryName`
`!declineMessage message`

- `appsChannel` and `applicantsCategory` must have different names. For example, both can't be named `apps`.

### Bot Commands

`!d user1234 [message]` - Decline an applicant.

- The applicant is pinged and sent a message in their channel with the provided message (or the set declineMessage if one isn't provided). A 👍 emoji is added as a reaction to the message and the applicant is asked to confirm that they've read the message by clicking on the reaction. Once the applicant has reacted, they are removed from the server and the channel is deleted.

- Those with the officer role can also click the reaction to close the application if the applicant never responds.

`!a user1234` - Accept an applicant. The Applicant role is immediately removed from the applicant and their channel is deleted.

`!l channelName1234 @userTag#1234` - Manually links a server member with an application. You can use this if an applicant did not correctly input their Discord Tag into the form or if they joined the server before submitting their application.

- The applicant needs to actually be tagged in the command as if you were mentioning them normally. Once linked, the Applicant role is immediately applied and the application is handled as if the applicant had just joined the server.
