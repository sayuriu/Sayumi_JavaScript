// All Sayumi settings for guilds go here.
const discord = require('discord.js');
const settings = require('./json/SettingsObjects.json');
const { Methods, GuildDatabase } = require('../MainModules');

module.exports = class Settings {

	static async AFKUsers(message, args)
	{
		const SettingsObject = settings.afk_users;

		const { userPass } = Methods.PermissionsCheck(SettingsObject, message);
		if (userPass === false) return message.channel.send(`**${message.member.displayName}**, you are lacking permissions to change this settings.`);

		const source = await GuildDatabase.get(message.guild);
		const status = source.AFKUsers;

		if (!args[1]) return message.channel.send(status ? 'This settings is enabled.' : 'This setting is disabled.');

		args[1] = args[1].toLowerCase();
		switch (args[1])
		{
			case 'enable':
			{
				if (status === true) return message.channel.send('This settings is already enabled.');

				GuildDatabase.update(message.guild, { AFKUsers: true });
				message.channel.send('Successfully enabled this settings.');
				break;
			}
			case 'disable':
			{
				if (status === true) return message.channel.send('This settings is already disabled.');

				GuildDatabase.update(message.guild, { AFKUsers: false });
				message.channel.send('Successfully enabled this settings.');
				break;
			}
		}
	}

	static async AllowReplyConfig(message, args)
	{
		const SettingsObject = settings.active_channels;

		const { userPass } = Methods.PermissionsCheck(SettingsObject, message);
		if (userPass === false) return message.channel.send(`**${message.member.displayName}**, you are lacking permissions to change this settings.`);

		const source = await GuildDatabase.get(message.guild);
		const AllowedReplyOn = source.AllowedReplyOn;

		const output = [];
        for (let i = 0; i < AllowedReplyOn.length; i++)
        {
            output.push(`<#${AllowedReplyOn[i]}>`);
        }
		if (!args[1] || args.length < 2)
		{
			const embed = new discord.MessageEmbed()
									.setColor('RANDOM')
									.setDescription(`Currently enabled channels: \n${output.join('\n')}`)
									.setFooter('Settings: Active channels');
			return message.channel.send(embed);
		}
		else
		{
			args[1] = args[1].toLowerCase();

			switch(args[1])
			{
				case 'add':
				{
					let _id;
					let confirm = false;
					const channelID = args[2].match(/^<?#?(\d+)>?$/);
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

					GuildDatabase.update(message.guild, { AllowedReplyOn: AllowedReplyOn });

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
					const channelID = args[2].match(/^<?#?(\d+)>?$/);
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

					GuildDatabase.update(message.guild, { AllowedReplyOn: AllowedReplyOn });
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

	static async UnknownCMDReply(message, args)
	{
		const SettingsObject = settings.unknown_replies;

		const { userPass } = Methods.PermissionsCheck(SettingsObject, message);
		if (userPass === false) return message.channel.send(`**${message.member.displayName}**, you are lacking permissions to change this settings.`);

		const source = await GuildDatabase.get(message.guild);
		const AllowedReplyOn = source.AllowedReplyOn;
		const FalseCMDReply = source.FalseCMDReply;

		const output = [];
        if (FalseCMDReply.length > 0) {
			for (let i = 0; i < FalseCMDReply.length; i++)
			{
				output.push(`<#${FalseCMDReply[i]}>`);
			}
		}

		if (args[1] !== undefined) args[1] = args[1].toLowerCase();

		if (!args[1] || args.length < 2 || args[1] === 'info' || args[1] === 'status' || args[1] === null)
		{
			if (AllowedReplyOn.length === FalseCMDReply.length) return message.channel.send('This setting is enabled globally.');
			if (output.length > 0 && AllowedReplyOn.length !== FalseCMDReply.length)
			{
				const embed = new discord.MessageEmbed()
						.setColor('RANDOM')
						.setDescription(`Currently enabled channels: \n${output.join('\n')}`)
						.setFooter('Settings: Unknown command response');
				message.channel.send(embed);
			}
			else return message.channel.send('This setting is disabled globally.');
		}
		else
		{
			switch (args[1])
			{
				case 'add':
				{
					let _id;
					let confirm = false;
					const channelID = args[2].match(/^<?#?(\d+)>?$/);
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

					GuildDatabase.update(message.guild, { FalseCMDReply: FalseCMDReply });

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
					const channelID = args[2].match(/^<?#?(\d+)>?$/);

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

					GuildDatabase.update(message.guild, { FalseCMDReply: FalseCMDReply });
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
	}

	static async MessageLog(message, args)
	{
		const SettingsObject = settings.message_log;

		const { userPass } = Methods.PermissionsCheck(SettingsObject, message);
		if (userPass === false) return message.channel.send(`**${message.member.displayName}**, you are lacking permissions to change this settings.`);

		const data = await GuildDatabase.get(message.guild);
		if (args[1] !== undefined) args[1] = args[1].toLowerCase();

		if (!args.length || args.length < 1 || args[1] === 'info' || args[1] === 'status' || args[1] === null)
		{
			const info = {
				status: data.MessageLogState,
				channelID: data.MessageLogChannel,
				logLimit: data.LogHoldLimit,
			};
			const embed = this.Embeds.messageLog(null, info);
			return message.channel.send(embed.info);
		}
		else
		{
			switch (args[1])
			{
				case 'enable':
				{
					if (data.MessageLogState === true) return message.channel.send('This setting is already enabled.');
					GuildDatabase.update(message.guild, { MessageLogState: true });
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
					GuildDatabase.update(message.guild, { MessageLogState: false });
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
					const channelID = args[2].match(/^<?#?(\d+)>?$/);
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

					GuildDatabase.update(message.guild, { MessageLogChannel: target.id });
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
					GuildDatabase.update(message.guild, { MessageLogChannel: null });
					const embed = new discord.MessageEmbed()
										.setColor('#757574')
										.setDescription(`Successfully cleared inform channel.`);
					message.channel.send(embed);
					break;
				}
				case 'setlimit':
				{
					if (isNaN(args[2])) return message.channel.send('The limit specified must be a number.');
					const amount = parseInt(args[2]);
					if (amount < 1 || amount > 5) return message.channel.send('The limit specified must be between `1` and `5`.');
					GuildDatabase.update(message.guild, { LogHoldLimit: amount });

					const embed = new discord.MessageEmbed()
										.setColor('#3aeb34')
										.setDescription(`Successfully changed value to \`${amount}\`.`)
										.setFooter('Setting: Deleted message logging');
					message.channel.send(embed);
					break;
				}
				default:
				{
					message.channel.send('Invalid option.');
				}
			}
		}
	}

	static async Prefix(message, args)
	{
		const SettingsObject = settings.prefix;

		const { userPass } = Methods.PermissionsCheck(SettingsObject, message);
		if (userPass === false) return message.channel.send(`**${message.member.displayName}**, you are lacking permissions to change this settings.`);

		const source = await GuildDatabase.get(message.guild);
		const prefix = source.prefix;
		if (!args.length || args.length < 2)
		{
			return message.channel.send(`The current prefix is \`${prefix}\``);
		}
		if (args[1])
		{
			if (args[1].length > 3) return message.channel.send('The new prefix can not be longer than 3 characters. Please try again.');
			GuildDatabase.update(message.guild, { prefix: args[1] });
			return message.channel.send(`The prefix has been updated to \`${args[1]}\``);
		}
	}
};