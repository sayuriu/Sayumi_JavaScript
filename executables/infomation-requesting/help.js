// @flag:needs-optimizations

const { MessageEmbed: EmbedConstructor, Collection } = require('discord.js');
const responses = require('../../utils/json/Responses.json');
const settingsList = require('../../utils/json/SettingsObjects.json');

module.exports = {
	name: 'help',
	aliases: ["holp", "helps", "?"],
	args: true,
	description: 'A help command for those in need.',
	group: ['Information', 'Utilities'],
	cooldown: 10,
	usage: '[category? command]',
	onTrigger: async (message, args, client) => {

		const ArrayOrString = (input) =>
		{
			if (Array.isArray(input))
			{
				const array = [];
				input.forEach(i => array.push(i.toString()));
				input = array;

				return { output: input, boolean: true };
			}
			return { output: input, boolean: false };
		};
		const { Randomize } = client.Methods.Common;

		const prefix = message.prefixCall;
		const settingsOptions = new Collection();

		for (const key in settingsList)
		{
			settingsOptions.set(settingsList[key].name, settingsList[key]);
		}

		if (!args.length)
		{
			// Categories
			const embed = new EmbedConstructor()
									.setColor('RANDOM')
									.setTitle("Help [Cagetories]")
									.setDescription(`*To see commands in a specified cagetory, type \`${prefix}help <cagetoryName>\` for more info.*`);

			const settings = client.CommandCategories.find(i => i.keywords.some(e => e === 'settings'));
			client.CommandCategories.delete(settings.name);
			client.CommandCategories.set(settings.name, settings);

			client.CommandCategories.forEach(category => {
				const CategoryKeyword = category.keywords[0] || 'Unaccessible';
				const length = category.commands.length;

				if (CategoryKeyword === 'settings') return embed.addField(`Internal Settings \`${CategoryKeyword}\``, `${settingsOptions.size} available setting${settingsOptions.size > 1 ? 's' : ''}`);
				embed.addField(`${category.name} \`${CategoryKeyword}\``, `${length > 0 ? `${length} command${length > 1 ? 's' : ''}` : 'No command found.'}`, true);
			});

			const tips = Randomize(responses.tips);
			if (tips.length > 0) embed.setFooter(`Tip: ${tips}`);
			return message.channel.send(embed);
		}

		if (args[0])
		{
			args[0] = args[0].toLowerCase();
			if (args[0].startsWith('help')) return client.emit('message', Object.assign(message, { content: `${prefix}${message.content}` }));

			let allCategories = [];
			let target;
			let onCategory = false;

			client.CommandCategories.forEach(t => allCategories = allCategories.concat(t.keywords));
			if (allCategories.some(i => i === args[0]))
			{
				target = client.CommandCategories.find(index => index.keywords?.some(i => i === args[0]));
				onCategory = true;
			}
			else target = client.CommandList.get(args[0]) || client.CommandList.find(cmd => cmd.aliases?.includes(args[0]));

			// If category
			if (target && onCategory)
			{

				// Settings
				if (target.keywords.some(keyword => keyword === 'settings'))
				{
					// first Embed constructor
					const embed = new EmbedConstructor()
											.setTitle('Help: Settings [Internal]')
											.setDescription(`You can change how Sayumi behaves in your server. \nType the option that you want to check.`)
											.setFooter('Type one of the settings above for more info or \'cancel\' to cancel this command.\nTimeout: 20 seconds');

					let string = '';

					settingsOptions.forEach(settings => {
						string += `${settings.title} \`${settings.name}\`\n> *${settings.description}*\n\n`;
					});
					embed.addField('List', string);
					const info = await message.channel.send(embed);

					// Await responses for options
					let response;
					let check = true;

					// Timeout
					const now = Date.now();
					let user = client.Timestamps.get(message.author.id);
					if (!user)
					{
						client.Timestamps.set(message.author.id, { timeout: now + 20000, id: message.author.id });
						user = client.Timestamps.get(message.author.id);
						setTimeout(() => client.Timestamps.delete(message.author.id), 20000);
					}

					// Functions
					const timeOutOptions_Text = async (msg, time) => {
						try {
							const List = [];
							settingsOptions.forEach(option => {
								List.push(option.name);
							});

							const timeLeft = time - Date.now();
							const options = List.concat(['cancel']);
							response = await msg.channel.awaitMessages(
								m => {
									if (options.some(item => item === m.content.toLowerCase()) && m.author.id === user.id) return m.content;
									return null;
								},
								{
									max: 1,
									maxProcessed: 1,
									time: timeLeft,
									errors: ['time'],
								},
							);

						} catch (error) {
							message.channel.send('Times up!').then(m => m.delete({ timeout: 3000 }));
							return check = false;
						}
					};

					// Send the embed
					const send = async () => {
						if (!response) return;
						if (response.size)
						{
							if (response.first().content.toLowerCase() === 'cancel')
							{
								message.channel.send('Cancelled!').then(m => m.delete({ timeout: 5000 }));
								return setTimeout(() => info.delete(), 5000);
							}
							const selectedSettings = settingsOptions.get(response.first().content);
							let usageIsArray = false;
							let usage = selectedSettings.usage;
							const name = selectedSettings.name;

							if (Array.isArray(usage))
							{
								const usageArray = [];
								selectedSettings.usage.forEach(i => {
									usageArray.push(`\`${prefix}settings ${name} ${i}\``);
								});
								if (usageArray.length === 1) usage = usageArray[0];
								else
								{
									usage = usageArray;
									usageIsArray = true;
								}
							}

							const toSend = new EmbedConstructor()
													.setTitle(`Settings: ${selectedSettings.title}`)
													.setColor('RANDOM')
													.setDescription(`**Permitted:** [${selectedSettings.reqUser}]\n *${selectedSettings.description}*`)
													.addField('Usage:', `${usageIsArray ? usage.join('\n') : `\`${prefix}settings ${name} ${usage}\``}`);

							if (selectedSettings.notes) toSend.setFooter(selectedSettings.notes.replace(/{prefix}/g, prefix));
							return await message.channel.send(toSend);
						}

						// Keep listening to user's input if the input is invalid, until time expires
						if (!response.size && user.timeout - now > 0 && check)
						{
							await timeOutOptions_Text(message, user.timeout);
							await send();
						}
						return;
					};
					await timeOutOptions_Text(message, user.timeout);
					await send();

					return;
				}
				else
				{
					const embed = new EmbedConstructor()
										.setTitle(`Category: ${target.name}`)
										.setColor(target.colorCode);

					const header = `${target.keywords.length > 1 ? `**Aliases:** \`${target.keywords.slice(1, target.keywords.length - 1).join(', ')}\`\n` : ''}*${target.descriptions && target.descriptions.length > 0 ? target.descriptions : 'No description available, yet!'}*\n**List:**\n`;

					// Page system
					const CMDinfoString = (category) => {
						const out = [];
						let initString = header;
						let indexRange;
						let pointer = 0;
						let startIndex = 0;

						for (let i = 0; i < category.commands.length; i++)
						{
							const cmd = client.CommandList.get(category.commands[i]);
							const additionalString = `\`${cmd.name}\` ${target.underDev.some(n => n === cmd.name) ? '`| Under Developement*`' : ''}\n- *${cmd.description || 'No description provided. Looks shady...'}*\n`;

							// Limit page every 10 cmds or 2048 chars
							if ((initString + additionalString).length > 2048 || (i + 1) % 10 === 0)
							{
								indexRange = `${startIndex + 1} to ${i}`;
								out[pointer] = [indexRange, initString];
								pointer++;
								startIndex = i;
								initString = header;
							}
							initString += additionalString;
						}
						indexRange = `${startIndex + 1} to ${category.commands.length}`;
						out[pointer] = [`${indexRange}`, initString];
						return out;
					};

					let pagePointer = isNaN(parseInt(args[1])) ? 0 : parseInt(args[1]) - 1;
					const list = CMDinfoString(target);

					const tips = Randomize(responses.tips);
					embed.setDescription(list[pagePointer][1]);
					embed.setFooter(`Available: ${target.commands.length} command${target.commands.length > 1 ? 's' : ''} ${list.length > 1 ? `(Showing ${list[pagePointer][0]})` : ''} \nCurrent prefix: ${prefix}${tips.length > 0 ? `\n${tips}` : ''}`);
					if (list.length < 2) return message.channel.send(embed);


					message.channel.send(embed).then(m => {
						const options = ['⏮', '◀', '▶', '⏭', '❌'];
						m.react('⏮');
						m.react('◀');
						if (list.length > 2)
						{
							options.push('#️⃣');
							m.react('#️⃣');
						}
						m.react('▶');
						m.react('⏭');
						m.react('❌');

						const filter = (reaction, reactUser) => options.includes(reaction.emoji.name) && reactUser.id === message.author.id;

						const timeLimit = 60000;
						let timedout;
						let userTimeout = client.Timestamps.get(message.author.id);
						if (!userTimeout)
						{
							userTimeout = client.Timestamps.get(message.author.id);
							client.Timestamps.set(message.author.id, Date.now() + timeLimit);
							setTimeout(() => client.Timestamps.delete(message.author.id), timeLimit);
						}

						const notifyInactive = (msg, em) => {
							msg.reactions.removeAll().catch(() => {
								const footerText = em.footer.text;
								em.setFooter((tips.length ? footerText.substr(0, footerText.lastIndexOf('\n')) : footerText) + '\nTHIS MESSAGE IS INACTIVE!');
								return msg.edit(em);
							});
						};

						const listener = async (msg, time) => {
							if (timedout || msg.deleted) return;

							await msg.awaitReactions(filter, { max: 1, time: time, errors: ['time'] })
							.then(received => {
								const reaction = received.first();
								msg.reactions.cache.get(reaction.emoji.name).users.remove(message.author.id);
								switch (reaction.emoji.name)
								{
									case '❌':
									{
										// msg.delete();
										timedout = true;
										notifyInactive(m, embed);
										break;
									}
									case '⏮':
									{
										pagePointer = 0;
										break;
									}
									case '◀':
									{
										if (pagePointer > 0) pagePointer--;
										break;
									}
									case '#️⃣':
									{
										listenerText(msg);
										break;
									}
									case '▶':
									{
										if (pagePointer < list.length - 1) pagePointer++;
										break;
									}
									case '⏭':
									{
										pagePointer = list.length - 1;
										break;
									}
								}
								if (!timedout)
								{
									embed.setDescription(list[pagePointer][1]);
									embed.setFooter(`Available: ${target.commands.length} command${target.commands.length > 1 ? 's' : ''} ${list.length > 1 ? `(Showing ${list[pagePointer][0]})` : ''} \nCurrent prefix: ${prefix}${tips.length > 0 ? `\n${tips}` : ''}`);
									msg.edit(embed);
								}
								const timeLeft = Date.now() - userTimeout;
								if (timeLeft > 0 && !timedout) return listener(msg, timeLeft);
								listener(msg, timeLimit);
							})
							.catch(() => {
								timedout = true;
								notifyInactive(m, embed);
							});
						};

						const listenerText = async (msg) => {
							let temp;
							const timeLeft = Date.now() - userTimeout;
							if (timedout || msg.deleted) return;
							msg.channel.send(`Which page do you want to go to?[1 - ${list.length}]`).then(_ => temp = _);
							const response = await msg.channel.awaitMessages(M => M.author.id === message.author.id && !isNaN(parseInt(M.content)), { max: 1, time: timeLeft, errors: ['time'] })
																.catch(e => timedout = true);
							const received = response.first();
							const index = parseInt(received.content);
							if (received.deletable) received.delete();
							temp.delete();

							if (index < 1 || index > list.length) return msg.channel.send('That\'s page is non-existant!').then(_ => _.delete({ timeout: 3000 }));
							pagePointer = index - 1;

							embed.setDescription(list[pagePointer][1]);
							embed.setFooter(`Available: ${target.commands.length} command${target.commands.length > 1 ? 's' : ''} ${list.length > 1 ? `(Showing ${list[pagePointer][0]})` : ''} \nCurrent prefix: ${prefix}${tips.length > 0 ? `\n${tips}` : ''}`);
							return msg.edit(embed);
						};

						listener(m, timeLimit);
					});
				}
			}

			// If command
			else if (target && !onCategory)
			{
				// Initial properties
				const name = target.name;
				const aliases = target.aliases;
				const desc = target.description && target.description.length > 0 ? target.description : 'No description available, yet!';
				const flags = target.flags ?? [];
				const cooldown = target.cooldown;
				const group = target.group ?? 'Unassigned';
				const guildOnly = target.guildOnly ?? false;
				const guildCooldown = target.guildCooldown ?? false;
				const master_explicit = target.master_explicit;

				// Usage
				const usage = target.usage || '`Passive | No input needed.`';
				const detailedUsage = target.usageSyntax ?? null;
				const usageString = toUsageString(usage, prefix, name, flags, client);
				let usageStringWithSyntax = toUsageString(detailedUsage, prefix, name, flags, client);
				if (usageStringWithSyntax.length < usageString.length) usageStringWithSyntax = usageString;

				// Usage parameters
				const StringSearch = message.client.Methods.Common.StringSearch;
				const reqPLeft = StringSearch(/\|</g, usageStringWithSyntax);
				const optPLeft = StringSearch(/\|\[/g, usageStringWithSyntax);
				const reqPRight = StringSearch(/>\|/g, usageStringWithSyntax);
				const optPRight = StringSearch(/]\|/g, usageStringWithSyntax);

				const requiredParams = [];
				const optionalParams = [];

				reqPLeft.forEach(i => {
					requiredParams.push(usageStringWithSyntax.substr(i + 2, reqPRight[reqPLeft.indexOf(i)] - i - 2));
				});

				optPLeft.forEach(i => {
					optionalParams.push(usageStringWithSyntax.substr(i + 2, optPRight[optPLeft.indexOf(i)] - i - 2));
				});

				// Perms
				const permSet = ArrayOrString(target.reqPerms || '');
				const { output: perms, boolean: permIsArray } = permSet;
				const permsString = `Required permissions: \`${permIsArray ? `${perms.join(', ')}` : perms}\``;

				// User
				const userSet = ArrayOrString(target.reqUser || '');
				const { output: user, boolean: userIsArray } = userSet;

				// Notes
				const noteSet = ArrayOrString(target.notes || '');
				const { output: notes, boolean: noteIsArray } = noteSet;

				const embed = new EmbedConstructor({
					color: 'random',
					title: `[${Array.isArray(group) ? `${group.join(', ')}` : group}] ` + `\`${name}\``,
					description: `${flags.some(n => n === 'Under Developement') ? '**[Under Development!]** __This command may not running as expected.__' : ''}\n*${desc}${perms.length > 0 ? `\n${permsString}*` : '*'}`,
					fields: [
						{
							name: 'Usage',
							value:  `${target.usage ? `${usageString}` : usage}\n` + `${requiredParams.length > 0  ? `\n\`<> ${requiredParams.join(', ')}\`` : ''}${optionalParams.length > 0 ? `\n\`[] ${optionalParams.join(', ')}\`` : ''}`
									+ `${notes.length > 0 ? `\n${noteIsArray ? `**Extra notes:**\n*${notes.join('\n')}*` : `**Extra notes:** *${notes}*`}` : ''}`,
						},
						{
							name: 'Command availability',
							value: master_explicit ? 'Master dedicated ~' :
									`${guildOnly ? `${user.length > 0 ? `[Guild only] ${userIsArray ? user.join(', ') : user}` : 'Guild only.'}` : Randomize(responses.commands.info.availability)}`,
							inline: true,
						},
						{
							name: 'Cooldown',
							value: cooldown > 0 ? `\`${cooldown}\` second${cooldown > 1 ? 's' : ''}${guildCooldown ? ', guild' : ''}` : 'None',
							inline: true,
						},
					],
					footer: {
						text: requiredParams.length > 0  ?
								`${optionalParams.length > 0 ? '<> required parameters' : '<> required parameters |'}` : ''
								+ optionalParams.length > 0 ? `${requiredParams.length > 0 ? ', [] optional parameters |' : '[] optional parameters |'}` : ''
								+ `Current prefix: ${prefix}`,
					},
				});
				if (aliases) embed.fields.unshift({
					name: Randomize(responses.commands.info.aliases),
					value: `\`${Array.isArray(aliases) ? aliases.join(', ') : aliases}\``,
				});

				return message.channel.send(embed);
			}
			return message.channel.send('Unknown category or command.');
		}
	},
};

function toUsageString(usage, prefix, name, flags, client)
{
	let usageIsArray = false;
	if (Array.isArray(usage))
	{
		const usageArray = [];
		usage.forEach(i => {
			usageArray.push(`\`${prefix}${name} ${i}\`${flags.length ? `\`| ${client.Methods.Common.JoinArrayString(flags)}\`` : ''}`);
		});
		if (usageArray.length === 1) usage = usageArray[0];
		else
		{
			usage = usageArray;
			usageIsArray = true;
		}
	}
	return usageIsArray ? usage.join('\n') : `\`${prefix + name} ${usage}\``;
}
