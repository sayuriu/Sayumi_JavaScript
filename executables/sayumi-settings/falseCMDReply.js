const guildActions = new (require('../../utils/Database/Methods/guildActions'));
const discord = require('discord.js');

module.exports = {
	name: 'falsereply',
	description: 'Settings for responses to unknown commands.',
	stable: true,
	guildOnly: true,
	reqPerms: 'MANAGE_CHANNELS',
	reqUser: 'Channel Manager',
	args: true,
	group: 'Settings',
	usage: ['[boolean? list]', '<add | remove> <channel ID / name or direct tag>'],
	onTrigger: async (message, args) => {
		const source = await guildActions.guildGet(message.guild);
		const AllowedReplyOn = source.AllowedReplyOn;
		const FalseCMDReply = source.FalseCMDReply;

		const output = [];
        if (FalseCMDReply.length > 0) {
			for (let i = 0; i < FalseCMDReply.length; i++)
			{
				output.push(`<#${FalseCMDReply[i]}>`);
			}
		}

		if (args[0] !== undefined) args[0] = args[0].toLowerCase();

		if (!args.length || args.length < 1 || args[0] === 'info' || args[0] === 'status' || args[0] === null)
		{
			if (AllowedReplyOn.length === FalseCMDReply.length) return message.channel.send('This setting is enabled globally.');
			if (output.length > 0 && AllowedReplyOn.length !== FalseCMDReply.length)
			{
				const embed = new discord.MessageEmbed()
						.setColor('RANDOM')
						.setDescription(`Currently enabled channels: \n${output.join('\n')}`)
						.setFooter('Setting: Unknown command response');
				message.channel.send(embed);
			}
			else return message.channel.send('This setting is disabled globally.');
		}
		if (args.length)
		{
			switch (args[0])
			{
				case 'add':
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

					if (!AllowedReplyOn.some(chID => chID === target.id)) return message.channel.send('Make sure I can send messages in that channel before you type this command.');

					const index = FalseCMDReply.indexOf(target.id);
					if (index > -1) return message.channel.send('The target channel already has this setting enabled.');
					else FalseCMDReply.push(target.id);

					guildActions.guildUpdate(message.guild, { FalseCMDReply: FalseCMDReply });

					const embed = new discord.MessageEmbed()
									.setColor('#3aeb34')
									.setDescription(`Successfully enabled unknown command replies in <#${target.id}>.`);
					message.channel.send(embed);
					break;
				}
				case 'remove':
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

					const index = FalseCMDReply.indexOf(target.id);
					if (index > -1)
					{
						AllowedReplyOn.splice(index, 1);
					} else return message.channel.send('This channel does not exist in my list.');

					guildActions.guildUpdate(message.guild, { FalseCMDReply: FalseCMDReply });
					const embed = new discord.MessageEmbed()
									.setColor('#eb3434')
									.setDescription(`Successfully disabled unknown command replies in <#${target.id}>.`);
					message.channel.send(embed);
					break;
				}
				case 'list':
				{
					if (output.length > 0)
					{
						const embed = new discord.MessageEmbed()
								.setColor('RANDOM')
								.setDescription(`Currently enabled channels: \n${output.join('\n')}`)
								.setFooter('Setting: Unknown command response');
						message.channel.send(embed);
					}
					else return message.channel.send('This setting is disabled globally.');
					break;
				}
				default:
				{
					return message.channel.send(`Please provide a valid option (either \`list\`, \`add\` or \`remove\`).`);
				}
			}
		}
	},
};