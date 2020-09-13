const guildActions = new (require('../../utils/Database/Methods/guildActions'));
const settings = new (require('../../utils/GuildSettings'));
const discord = require('discord.js');

module.exports = {
	name: 'settings',
	description: 'Configurate Sayumi\'s settings for your current server.',
	args: true,
	guildOnly: true,
	usage: '[<name> <options>]',
	group: 'Settings',
	notes: 'If no arguments are provided, that will display settings\' status instead.',
	settings_explicit: true,
	onTrigger: async (message, args) => {
		const source = await guildActions.guildGet(message.guild);

		if (args[1] !== undefined) args[1] = args[1].toLowerCase();

		if (!args.length || args.length < 1 || args[0] === 'info' || args[0] === 'status' || args[0] === null)
		{
			const channelPush = channelArray => {
				const output = [];
				for (let i = 0; i < channelArray.length; i++)
				{
					output.push(`<#${channelArray[i]}>`);
				}
				return output;
			};

			const SettingsObject = {
				activeChannels: channelPush(source.AllowedReplyOn),
				falseReply: channelPush(source.FalseCMDReply).length > 0 ? channelPush(source.FalseCMDReply) : 'Empty.',
				logState: source.MessageLogState,
				logLimit: source.LogHoldLimit,
				afk: source.AFKUsers,
			};
			const embed = new discord.MessageEmbed()
									.setTitle('Settings')
									.setDescription(`Now showing settings for guild [${message.guild.name}]`)
									.setColor('#42e3f5')
									.addField('Active channels', `*Note: Sayumi will only listen for commands on those channels.*\n${SettingsObject.activeChannels.length > 15 ? `${SettingsObject.activeChannels.length} channels` : SettingsObject.activeChannels.join(' ')}`)
									.addField('Unknown command replies', `*Responses to unknown commands.*\n${SettingsObject.falseReply.length > 15 ? `${SettingsObject.falseReply.length} channels` : `${Array.isArray(SettingsObject.falseReply) ? `${SettingsObject.falseReply.join(' ')}` : `${SettingsObject.falseReply}`}`}`)
									.addFields([
										{ name: 'Edit / deleted message logging', value: `${SettingsObject.logState ? 'Enabled' : 'Disabled'} \`| ${SettingsObject.logLimit}\``, inline: true },
										{ name: 'AFK users settings', value: `${SettingsObject.afk ? 'Enabled' : 'Disabled'}`, inline: true },
									])
									.setFooter(`Current prefix: ${source.prefix}`);
			return message.channel.send(embed).catch(err => { return message.channel.send('I can\'t send the embed...'); });
		}
		else
		{
			args[0] = args[0].toLowerCase();
			const msglog = ['msglog', 'log'];
			switch (args[0])
			{
				case 'replyon':
				{
					settings.allowReplyConfig(message, args);
					break;
				}
				case msglog.some(i => i === args[0]):
				{
					settings.MessageLog(message, args);
					break;
				}
				case 'unknowncmd':
				{
					settings.UnknownCMDReply(message, args);
					break;
				}
				default: return message.channel.send('Invalid option name.');
			}
		}
	},
};