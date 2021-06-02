import {Applicant} from './applicant.js'

export function initText(settings: Record<string, string>): string {
	return (
		'Run any of the following commands to override the defaults for discord-app-bot. (Everything is case-insensitive)' +
		'\n\n' +
		'Current Settings:' +
		'```\n' +
		`Officer Role: ${settings.officerRole}\n` +
		`Applicant Role: ${settings.applicantRole}\n` +
		`Apps Channel: ${settings.appsChannel}\n` +
		`Applicants Category: ${settings.applicantsCategory}\n` +
		`Decline Message: ${settings.declineMessage}\n` +
		'```' +
		'\n' +
		'Command Example: `!officerRole Officer`' +
		'\n\n' +
		'`!officerRole roleName` - **DEFAULT:** `officer` | Anyone with this role will be able to use discord-app-bot commands/handle applications.\n' +
		'`!applicantRole roleName` - **DEFAULT:** `applicant` | This is the role that is automatically applied to applicants when they join the server.\n' +
		'`!appsChannel channelName` - **DEFAULT:** `apps` | This is the channel where your Google form gets pushed to.\n' +
		'`!applicantsCategory categoryName` - **DEFAULT:** `applicants` | This is the channel category where the individual applicant channels are created.\n' +
		'`!declineMessage message` - **DEFAULT:** `none` | This will be sent as the message for the `!d` command when you run it without providing a message.' +
		'\n\n' +
		"**Note:** `appsChannel` and `applicantsCategory` must have different names. For example, both can't be named `apps`."
	)
}

export function appResponse(applicant: Applicant): string {
	if (!applicant.memberID) {
		throw new Error('Member ID does not exist.')
	}

	return (
		`<@${applicant.memberID}` +
		'>\n\n' +
		'Thank you for your application. Once a decision has been made, you will be messaged/pinged with a response.'
	)
}
