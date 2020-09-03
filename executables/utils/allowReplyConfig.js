const guildActions = new (require('../../utils/Database/Methods/guildActions'));
const discord = require('discord.js');

module.exports = {
	name: 'replyconfig',
	description: 'Configure channels that Sayumi can send messages to.',
	stable: true,
	guildOnly: true,
	args: true,
	usage: '[add | remove | list?] (channel ID or name)',
	onTrigger: async (message, args) => {
		const source = await guildActions.guildGet(message.guild);
		const AllowedReplyOn = source.AllowedReplyOn;

		const output = [];
        for (let i = 0; i < AllowedReplyOn.length; i++)
        {
            output.push(`<#${AllowedReplyOn[i]}>`);
        }
		if (!args.length || args.length < 1)
		{
			const embed = new discord.MessageEmbed()
									.setColor('RANDOM')
									.setDescription(`Currently enabled channels: \n${output.join('\n')}`);
			return message.channel.send(embed);
		}
		if (args.length)
		{
			args[0] = args[0].toLowerCase();
			if (!message.member.permissions.has('MANAGE_CHANNELS') && args[0] !== 'list') return message.channel.send(`**${message.member.displayName}**, you are lacking permission to do so.`);
			else
			{
				switch(args[0])
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

						const index = AllowedReplyOn.indexOf(target.id);
						if (index > -1) return message.channel.send('The channel is already existed in my list.');
						else AllowedReplyOn.push(target.id);

						guildActions.guildUpdate(message.guild, { AllowedReplyOn: AllowedReplyOn });

						const embed = new discord.MessageEmbed()
										.setColor('#3aeb34')
										.setDescription(`Successfully added <#${target.id}> to the list.`);
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

						const index = AllowedReplyOn.indexOf(target.id);
						if (index > -1)
						{
							AllowedReplyOn.splice(index, 1);
						} else return message.channel.send('The channel does not exist in my list.');

						guildActions.guildUpdate(message.guild, { AllowedReplyOn: AllowedReplyOn });
						const embed = new discord.MessageEmbed()
										.setColor('#eb3434')
										.setDescription(`Successfully removed <#${target.id}> from the list.`);
						message.channel.send(embed);
						break;
					}
					case 'list':
					{
						const embed = new discord.MessageEmbed()
									.setColor('RANDOM')
									.setDescription(`Currently enabled channels: \n${output.join('\n')}`);
						message.channel.send(embed);
						break;
					}
					default:
					{
						return message.channel.send(`Please provide a valid option (either \`list\`, \`add\` or \`remove\`).`);
					}
				}
			}
		}
	},
};
