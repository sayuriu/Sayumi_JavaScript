const discord = require('discord.js');
const guildActions = require('../../utils/Database/Methods/guildActions');
const Functions = require('../../utils/Functions');
const Logger = require('../../utils/Logger');
const Embeds = new (require('../../utils/embeds'));
const responses = require('../../utils/responses.json');
const DefaultSettings = require('../../utils/DefaultGlobalSettings.json');
const Guild = new guildActions;
const functions = new Functions;
const logger = new Logger;
require('dotenv').config();
const { master } = process.env;

module.exports = {
	name: 'message',
	stable: true,
	onEmit: async (client, message) => {
		// Get the info first.
		let prefix = DefaultSettings.prefix;
		let source;
		const maid = client.user.id;
		const mention = `<@!${maid}>`;

		// Gets the prefix if the message is sent in a guild.
		if (message.guild)
		{
			source = await Guild.guildGet(message.guild);
			prefix = source.prefix;
		}

		// AFK section
		if (message.guild && source.AFKUsers)
		{
			const userArray = [];

			// Remove AFK for users
			const IfAFK = client.AFKUsers.get(message.author.id);
			if (IfAFK)
			{
				if (message.guild.me.permissions.has('MANAGE_NICKNAMES')) message.member.setNickname(IfAFK.name).catch(err => {message.channel.send('...').then(m => m.delete(2500)); });
				client.AFKUsers.delete(message.author.id);
				if (message.guild && source.AllowedReplyOn.some(channelID => channelID === IfAFK.lastChannel)) client.channels.cache.find(channel => channel.id === IfAFK.lastChannel).send(`Welcome back <@!${IfAFK.id}>, I have removed your AFK!`).then(m => m.delete(4000));
				else;
			}

			// AFK on ping
			if (message.mentions.users.size > 0)
			{
				message.mentions.users.forEach(user => {
					const userMention = client.AFKUsers.get(user.id);
					if (userMention) userArray.push(userMention);
				});
				if (userArray.length === 1)
					{
						const target = userArray[0];
						const { hour, minute, second } = functions.TimestampToTime(Date.now() - target.AFKTimeStamp);
						let timeString = '';

						if (hour) timeString = `${hour} hour${hour > 1 ? 's' : ''}`;
						if (minute > 0 && hour === 0) timeString = `${minute} minute${minute > 1 ? 's' : ''}`;
						if (second > 0 && minute === 0 && hour === 0) timeString = 'Just now';

						return message.channel.send(`**${target.name}** is currently AFK${target.reason ? `: *${target.reason}*` : '.'} **\`[${timeString}]\`**`);
					}
					else if (userArray.length > 1) return message.channel.send(`Two or more users you are mentioning are currently AFK.`);
			}
		}

		// She starts listening if the message starts with a prefix or a direct mention.
		if (message.content.startsWith(prefix) || message.content.startsWith(mention))
		{
			let mentionID = false;
			if (message.author.bot) return;
			if (message.content.startsWith(mention))
			{
				prefix = mention;
				mentionID = true;
			}

			// Returns when the message is sent in an appropriate channel (In guilds ofcourse)
			if (message.guild && !source.AllowedReplyOn.some(channelID => channelID === message.channel.id)) return;
			else
			{
				message.content = functions.EscapeRegExp(message.content);
				const args = message.content.slice(mentionID ? prefix.length + 1 : prefix.length).split(/ +/);
				const CommandName = args.shift().toLowerCase();

				// Look up for the command
				const RequestedCommand = client.CommandList.get(CommandName) ||
											client.CommandList.find(cmd => cmd.aliases && cmd.aliases.includes(CommandName));

				// If the command doesn't exist
				if (!RequestedCommand) {
					const typo = CommandName;
					const NotACmd = [
						"This is not a vaild command for me.",
						`Perhaps a typo, ${message.guild ? message.member.displayName : message.author.username}?`,
						"I can't issue this.",
						`Use \`${prefix}help\` for a help list if you are confused.`,
						`What is *${typo}*?`,
						`If that is an unadded feature, consider typing \`${mentionID ? '@Sayumi' : prefix}feedback ${typo}\` if you want this feature/command added to my collection.`,
					];
					const res = functions.Randomized(NotACmd);
					if (message.channel.type === 'dm' || source.FalseCMDReply.some(chID => chID === message.channel.id))
					{
						// functions.Cooldown(client.Cooldowns, typo, 3, message.author.id, message);
						return message.channel.send(res);
					}
					else return;
				}

				// Else....
				else
				{
					// Sending guild-only commands through DMs
					if (RequestedCommand.guildOnly && message.channel.type === 'dm')
					{
						return message.reply(functions.Randomized(responses.commands.guild_only_invalid));
					}

					// Cooldowns (throttling)
					const cooldowns = client.Cooldowns;
					const now = Date.now();

					if (!cooldowns.has(RequestedCommand.name)) cooldowns.set(RequestedCommand.name, new discord.Collection());

					const timestamps = cooldowns.get(RequestedCommand.name);
					const cooldownAmount = (RequestedCommand.cooldown || 2) * 1000;

					// Guild cooldowns
					if (RequestedCommand.guildCooldown && message.guild)
					{
						if (timestamps.has(message.guild.id))
						{
							const expirationTime = timestamps.get(message.guild.id) + cooldownAmount;

							if (now < expirationTime && message.author.id !== master)
							{
								const timeLeft = (expirationTime - now) / 1000;
								return message.reply(
									`please wait ${timeLeft.toFixed(1)} second${ Math.floor(timeLeft) > 1 ? 's' : '' } before reusing the \`${RequestedCommand.name}\` command.`,
								);
							}
						}

						timestamps.set(message.guild.id, now);
						setTimeout(() => timestamps.delete(message.guild.id), cooldownAmount);
					}
					// User cooldowns
					else
					{
						if (timestamps.has(message.author.id))
						{
							const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

							if (now < expirationTime && message.channel.type !== 'dm' && message.author.id !== master)
							{
								const timeLeft = (expirationTime - now) / 1000;
								return message.reply(
									`please wait ${timeLeft.toFixed(1)} second${ Math.floor(timeLeft) > 1 ? 's' : '' } before reusing the \`${RequestedCommand.name}\` command.`,
								);
							}
						}

						timestamps.set(message.author.id, now);
						setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
					}

					// If the command requires args... But the user doesn't includes many.
					// Note: Added reqArgs for commands that specifically requires args.
					if (RequestedCommand.args && RequestedCommand.reqArgs && !args.length)
					{
						// Eval command-explicit
						if (RequestedCommand.terminal) return message.channel.send('Terminal standing by.').then(m => m.delete(4000));
						// For normal commands
						else
						{
							let string;
							if (RequestedCommand.usage) string = `\nUsage: \`${prefix}${RequestedCommand.name} ${RequestedCommand.usage}\`.`;
							return message.channel.send(`${functions.Randomized(responses.commands.empty_arguments)} ${string || ''}`);
						}
					}

					// Master-explicit commands
					if (RequestedCommand.master_explicit && message.author.id !== master) {
						return message.channel.send(`Sorry ${message.author}, but this command can be issued by my master only.`).then(msg => {
							if (message.channel.name.includes('general')) return msg.delete(4000);
							else return msg.delete(6000);
						});
					}

					// NSFW commands
					if (RequestedCommand.nsfw === 'partial' && message.channel.type !== 'dm')
					{
						if (source.AllowPartialNSFW === false) return message.channel.send('Please execute this command from an appropriate channel.').then(m => m.delete(3000));
						const boolean = client.Channels.get(message.channel.id);
						if (!boolean)
						{
							message.channel.send('This command is partial NSFW. You have been warned.');
							client.Channels.set(message.channel.id, true);
							setTimeout(() => client.Channels.delete(message.channel.id), 180000);
						}
						else;
					}
					if (RequestedCommand.nsfw === true && message.channel.type !== 'dm' && message.channel.nsfw === false)
					{
						if (message.deletable) message.delete();
						return message.channel.send('Please execute this command from an appropriate channel.').then(m => m.delete(3000));
					}

					// Perms checking
					if (RequestedCommand.reqPerms && message.guild)
					{
						let uConfirm = true;
						let meConfirm = true;
						let array = false;
						const required = [];
						if (Array.isArray(RequestedCommand.reqPerms))
						{
							RequestedCommand.reqPerms.forEach(permission => {
								if (message.member.permissions.has(permission)) return;
								uConfirm = false;
							});

							RequestedCommand.reqPerms.forEach(permission => {
								if (message.guild.me.permissions.has(permission)) return;

								required.push(permission);
								array = true;
								meConfirm = false;
							});
						}
						else
						{
							if (!message.member.permissions.has(RequestedCommand.reqPerms)) uConfirm = false;
							if (!message.guild.me.permissions.has(RequestedCommand.reqPerms)) meConfirm = false;
						}

						if (uConfirm === false) return message.channel.send(`**${message.member.displayName}**, you are lacking permission to do so.`);
						if (meConfirm === false) return message.channel.send(`Lacking permissions: \`${array ? `${required.length > 1 ? required.join(', ') : required[0]}` : RequestedCommand.reqPerms}\``);
					}

					// Try executing the command
					try {
						if (RequestedCommand.args) RequestedCommand.onTrigger(message, args, client);
						else RequestedCommand.onTrigger(message, client);
					// Catch errors
					} catch (error) {
						logger.error(`[Command Execution] An error has occured while executing "${RequestedCommand.name}": \n${error.message}`);
						client.channels.cache.find(ch => ch.id === '630334027081056287').send(Embeds.error(message, error.message));
						if (message.channel.type === 'text') return message.channel.send(functions.Randomized(responses.errors.command_errors));
						else return message.reply(functions.Randomized(responses.errors.command_errors));
					}
				}
			}
		}
		else return;
	},
};