// All Sayumi settings for guilds go here.
const guildActions = new (require('./Database/Methods/guildActions'));
const embeds = new (require('./embeds'));
const discord = require('discord.js');


module.exports = class Settings {
	async allowReplyConfig(message, args)
	{
		const data = await guildActions.guildGet(message.guild);
		if (args[0] !== undefined) args[0] = args[0].toLowerCase();

		if (!args.length || args.length < 1 || args[0] === 'info' || args[0] === 'status' || args[0] === null)
		{
			const info = {
				status: data.MessageLogState,
				channelID: data.MessageLogChannel,
				logLimit: data.LogHoldLimit,
			};
			const embed = embeds.messageLog(null, info);
			return message.channel.send(embed.info);
		}
		else
		{
			switch (args[0])
			{
				case 'enable':
				{
					if (data.MessageLogState === true) return message.channel.send('This setting is already enabled.');
					guildActions.guildUpdate(message.guild, { MessageLogState: true });
					const embed = new discord.MessageEmbed()
										.setColor('#3aeb34')
										.setDescription(`Successfully enabled this setting.`);
					if (data.MessageLogChannel === '') embed.setFooter(`There is no channel for me to send reports! Use ${data.prefix}${this.name} set <channel> to enable logging.`);
					message.channel.send(embed);
					break;
				}
				case 'disable':
				{
					if (data.MessageLogState === false) return message.channel.send('This setting is already disabled.');
					guildActions.guildUpdate(message.guild, { MessageLogState: false });
					const embed = new discord.MessageEmbed()
										.setColor('#757574')
										.setDescription(`Successfully disabled this setting.`);
					message.channel.send(embed);
					break;
				}
				case 'set':
				{
					let _id;
					let confirm = false;
					const channelID = args[1].match(/^<?#?(\d+)>?$/);
					if (channelID !== null)
					{
						_id = channelID[1];
						confirm = true;
					}
					else if (!channelID) _id = null;
					const target = message.guild.channels.cache.find(ch => confirm ? ch.id === _id : ch.name === args[1]);
					if (!target) return message.channel.send('Can\'t find the channel you specified.');

					if (!data.AllowedReplyOn.some(chID => chID === target.id)) return message.channel.send('Make sure I can send messages in that channel before you type this command.');
					if (target.id === data.MessageLogChannel) return message.channel.send('Already using that channel.');

					guildActions.guildUpdate(message.guild, { MessageLogChannel: target.id });
					const embed = new discord.MessageEmbed()
										.setColor('#eb3434')
										.setDescription(`Successfully set <#${target.id}> as inform channel.`)
										.setFooter('Setting: Deleted message logging');
					if (data.MessageLogState === false) embed.setFooter(`The log setting is currently disabled! You can enable anytime by typing ${data.prefix}${this.name} enable`);
					message.channel.send(embed);
					break;
				}
				case 'clear':
				{
					guildActions.guildUpdate(message.guild, { MessageLogChannel: null });
					const embed = new discord.MessageEmbed()
										.setColor('#757574')
										.setDescription(`Successfully cleared inform channel.`);
					message.channel.send(embed);
					break;
				}
				case 'setlimit':
				{
					if (isNaN(args[1])) return message.channel.send('The limit specified must be a number.');
					const amount = parseInt(args[1]);
					if (amount < 1 || amount > 5) return message.channel.send('The limit specified must be between `1` and `5`.');
					guildActions.guildUpdate(message.guild, { LogHoldLimit: amount });

					const embed = new discord.MessageEmbed()
										.setColor('#3aeb34')
										.setDescription(`Successfully changed value to \`${amount}\`.`)
										.setFooter('Setting: Deleted message logging');
					message.channel.send(embed);
					break;
				}
				default:
				{
					return message.channel.send(`Invalid option.`);
				}
			}
		}
	}
};
