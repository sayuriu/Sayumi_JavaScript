const { Collection } = require('discord.js');
const { commands: { problems, only_prefix, error: commandError } } = require('../../utils/json/Responses.json');
const { prefix: DefaultPrefix } = require('../../utils/json/DefaultGlobalSettings.json');

module.exports = {
	name: 'message',
	onEmit: async (client, message) => {

		// Get the info first.
		let prefix = DefaultPrefix;
		let source;
		const mention_self = `<@!${client.user.id}>`;
		const { Common: { Randomize }, DiscordClient: { SelfMessageDelete } } = client.Methods;
		const SelfDeteleMsg = (msg, duration = 3000) => SelfMessageDelete(msg, { timeout: duration });

		// Gets the prefix if the message is sent in a guild.
		if (message.guild)
		{
			source = await client.Database.Guild.loadFromCache(message.guild);
			prefix = source.prefix;

			if (message.guild['newGuild'])
			{
				// Setup message ...
				delete message.guild['newGuild'];
			}
		}

		message.prefixCall = prefix;
		// AFK section
		if (message.guild && source.AFKUsers)
		{
			const userArray = [];

			// Remove AFK for users
			const IfAFK = client.AFKUsers.get(message.author.id);
			if (IfAFK)
			{
				if (message.guild.me.permissions.has('MANAGE_NICKNAMES')) await message.member.setNickname(IfAFK.name).catch(err => {message.channel.send('...').then(m => m.delete({ timeout: 2500 })); });
				client.AFKUsers.delete(message.author.id);
				if (message.guild && source.AllowedReplyOn.some(channelID => channelID === IfAFK.lastChannel)) client.channels.cache.find(channel => channel.id === IfAFK.lastChannel).send(`Welcome back <@!${IfAFK.id}>, I have removed your AFK!`).then(m => SelfDeteleMsg(m, 4000));
				else;
			}

		// AFK on ping (needs rework)
		if (message.mentions.users.size > 0)
			{
				message.mentions.users.forEach(user => {
					const userMention = client.AFKUsers.get(user.id);
					if (userMention) userArray.push(userMention);
				});
				if (userArray.length === 1)
				{
					const target = userArray[0];
					const { hour, minute, second } = client.Methods.Time.TimestampToTime(Date.now() - target.AFKTimeStamp);
					let timeString = '';

					if (hour) timeString = `${hour} hour${hour > 1 ? 's' : ''}`;
					if (minute > 0 && !hour) timeString = `${minute} minute${minute > 1 ? 's' : ''}`;
					if (second > 0 && !minute && !hour) timeString = 'Just now';

					return message.channel.send(`**${target.name}** is currently AFK${target.reason ? `: *${target.reason}*` : '.'} **\`[${timeString}]\`**`);
				}
				if (userArray.length > 1) return message.channel.send(`Two or more users you are mentioning are currently AFK.`);
			}
		}

		// She starts listening if the message starts with a prefix or a direct mention.
		if (message.content.startsWith(prefix) || message.content.startsWith(mention_self))
		{
			let mentionID = false;
			if (message.author.bot) return;
			if (message.content.startsWith(mention_self))
			{
				prefix = mention_self;
				mentionID = true;
			}

			// Returns when the message is sent in the listened channel (In guilds ofcourse)
			if (message.guild && !source.AllowedReplyOn.includes(message.channel.id)) return;

			// If command is typed in an evaluation instance channel
			if (client.EvaluatingSessions.get((parseInt(message.author.id) + parseInt(message.channel.id)).toString(16))) return;

			else
			{
				const args = message.content.slice(mentionID ? prefix.length + 1 : prefix.length).split(/ +/);
				const CommandName = args.shift().toLowerCase();

				if (!CommandName.length)
				{
					if (message.channel.type === 'dm' || source.FalseCMDReply.includes(message.channel.id))
					{
						// functions.Cooldown(client.Cooldowns, typo, 3, message.author.id, message);
						return message.channel.send(only_prefix);
					}
					else return;
				}

				// Look up for the command
				const RequestedCommand = client.CommandList.get(CommandName) ||
											client.CommandList.find(cmd => cmd.aliases?.includes(CommandName));

				// If the command doesn't exist
				if (!RequestedCommand) {
					const typo = CommandName;

					const NotACmd = problems.invalid;
					const res = Randomize(NotACmd)
								.replace(/\${typo}/g, typo)
								.replace(/\${memberName}/g, message.guild ? message.member.displayName : message.author.username)
								.replace(/\${thisPrefix}/g, prefix);

					if (message.channel.type === 'dm' || source.FalseCMDReply.includes(message.channel.id))
					{
						// functions.Cooldown(client.Cooldowns, typo, 3, message.author.id, message);
						message.channel.send(res);
					}
					return;
				}


				// Sending guild-only commands through DMs
				if (RequestedCommand.guildOnly && message.channel.type === 'dm') return message.reply(Randomize(problems.guild_only_invalid));

				// Cooldowns (throttling)
				const cooldowns = client.Cooldowns;
				const now = Date.now();

				if (!cooldowns.has(RequestedCommand.name)) cooldowns.set(RequestedCommand.name, new Collection());

				const timestamps = cooldowns.get(RequestedCommand.name);
				const cooldownAmount = (RequestedCommand.cooldown || 2) * 1000;
				const master = message.author.id === client.master;

				// Guild cooldowns
				if (RequestedCommand.guildCooldown && message.guild)
				{
					if (timestamps.has(message.guild.id))
					{
						const expirationTime = timestamps.get(message.guild.id) + cooldownAmount;

						// @suggest: use while loop
						if (now < expirationTime && !master)
						{
							const timeLeft = (expirationTime - now) / 1000;
							return message.reply(
								[
									// @flagged:needs-optimizations
									`please wait ${timeLeft.toFixed(0)} second${ Math.floor(timeLeft) > 1 ? 's' : '' } before reusing`,
									`please cool down! \`[${timeLeft.toFixed(0)} second${ Math.floor(timeLeft) > 1 ? 's' : '' }]\``,
								][Math.floor(Math.random() * 2)],
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

						if (now < expirationTime && message.channel.type !== 'dm' && !master)
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
				if (RequestedCommand.reqArgs && !args.length)
				{
					let string;
					if (RequestedCommand.prompt) return message.channel.send(RequestedCommand.prompt);
					if (RequestedCommand.usage) string = `\nUsage: \`${prefix}${RequestedCommand.name} ${RequestedCommand.usage}\`.`;
					return message.channel.send(`${Randomize(problems.empty_arguments)} ${string || ''}`);
				}

				// Master-explicit commands
				if (RequestedCommand.master_explicit && !master) {
					return message.channel.send(`Sorry ${message.author}, but this command can be issued by master only.`).then(msg => {
						if (message.channel.name.includes('general')) return SelfDeteleMsg(msg, 3000);
						return msg.delete({ timeout: 5000 });
					});
				}

				// NSFW commands (needs rework)
				if (RequestedCommand.nsfw === 'partial' && message.channel.type !== 'dm')
				{
					if (!source.AllowPartialNSFW) return message.channel.send('Please execute this command from an appropriate channel.').then(m => SelfDeteleMsg(m, 3000));
					const boolean = client.Channels.get(message.channel.id);
					if (!boolean)
					{
						message.channel.send('This command is partial NSFW. You have been warned.');
						client.Channels.set(message.channel.id, true);
						setTimeout(() => client.Channels.delete(message.channel.id), 180000);
					}
				}
				if (RequestedCommand.nsfw && message.channel.type !== 'dm' && !message.channel.nsfw)
				{
					if (message.deletable) message.delete();
					return message.channel.send('Please execute this command from an appropriate channel.').then(m => SelfDeteleMsg(m, 3000));
				}

				// Perms checking
				if (RequestedCommand.reqPerms && message.guild)
				{
					let uConfirm = true;
					let meConfirm = true;
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
							meConfirm = false;
						});
					}
					else
					{
						if (!message.member.permissions.has(RequestedCommand.reqPerms)) uConfirm = false;
						if (!message.guild.me.permissions.has(RequestedCommand.reqPerms)) meConfirm = false;
					}

					if (!uConfirm) return message.channel.send(`**${message.member.displayName}**, you are lacking permission to do so.`);
					if (!meConfirm) return message.channel.send(`Lacking permissions: \`${required.join(', ')}\``);
				}

				// Try executing the command
				try {
					if (typeof RequestedCommand.group === 'string') RequestedCommand.group = [RequestedCommand.group];
					if ((RequestedCommand.group || []).includes('Music'))
					{
						// if not in vc
						if (!message.member.voice.channel) return message.channel.send('Please join the VC.');
						if (!message.guild.voice) message.member.voice.channel.join();

						const queue = client.MusicPlayer.getQueue(message);
						if (queue)
						{
							const ListenerChannel = queue.firstMessage.channel;
							const VoiceChannel = queue.voiceConnection.channel;
							// if not in text
							if (message.channel.id !== ListenerChannel.id) return message.channel.send(`You are supposed to type the request in <#${ListenerChannel.id}>!`);
							// if not in voice
							if (message.member.voice?.channelID !== VoiceChannel.id) return message.channel.send('Join the same voice channel as me to run requests.');
						}
					}

					if (RequestedCommand.terminal) return RequestedCommand.onTrigger (message, prefix, client);
					if (RequestedCommand.args || RequestedCommand.reqArgs) return RequestedCommand.onTrigger(message, args, client);
					return RequestedCommand.onTrigger(message, client);
				// Catch errors
				} catch (error) {
					client.Log.error(`[Command Execution] An error has occured while executing "${RequestedCommand.name}": \n${error.message} \n${error.stack ?? ''}`);
					client.channels.cache.find(ch => ch.id === process.env.BUG_CHANNEL_ID).send(client.Embeds.error(message, error.message));
					if (message.channel.type === 'text') return message.channel.send(Randomize(commandError));
					return message.reply(Randomize(commandError));
				}
			}
		}
	},
};