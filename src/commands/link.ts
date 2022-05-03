import { SlashCommandBuilder } from '@discordjs/builders'
import slugify from '@sindresorhus/slugify'
import { CommandInteraction } from 'discord.js'
import { getApplicant, saveApplicant } from '../applicant.js'
import { Command } from '../commands.js'
import storage from '../storage.js'
import { checkSettings, Settings } from './settings.js'

const link: Command = {
  data: new SlashCommandBuilder()
    .setName('link')
    .setDescription('Link an applicant.')
    .addStringOption((option) =>
      option
        .setName('channel')
        .setDescription('Enter the channel name that the applicant will be linked to.')
        .setRequired(true),
    )
    .addUserOption((option) =>
      option
        .setName('applicant')
        .setDescription('The applicant to be linked to the selected channel.')
        .setRequired(true),
    ) as SlashCommandBuilder,
  run: async (interaction: CommandInteraction) => {
    if (!(await checkSettings(interaction))) return
    const settings = storage.getObject<Settings>('/settings')

    const channelName = interaction.options.getString('channel')
    if (!channelName) return await interaction.reply('Unable to get channel option.')

    const name = slugify(channelName)
    const applicant = getApplicant(name)
    if (!applicant) return await interaction.reply(`Applicant does not exist: ${name}`)

    const user = interaction.options.getUser('applicant')
    if (!user) return await interaction.reply(`Unable to get user option.`)

    if (!interaction.guild) return await interaction.reply(`Unable to get guild.`)
    const member = await interaction.guild.members.fetch(user.id).catch(console.error)
    if (!member) return await interaction.reply(`Unable to get member.`)

    applicant.memberId = member.id
    applicant.tag = member.user.tag
    saveApplicant(applicant)

    await member.roles.add(settings.applicantRole.id).catch(console.error)

    const channel = await member.guild.channels.fetch(applicant.channelId)
    if (!channel || channel.type !== 'GUILD_TEXT')
      throw new Error(`channel does not exist for applicant: ${applicant.tag}`)

    await channel.permissionOverwrites.create(member.user, { VIEW_CHANNEL: true })

    const appResponse =
      `<@${applicant.memberId}` +
      '>\n\n' +
      'Thank you for your application. Once a decision has been made, you will be messaged/pinged with a response.'
    await channel.send(appResponse).catch(console.error)

    await interaction.reply(`${member.user.tag} has been linked to ${name}.`)
  },
}

export default link
