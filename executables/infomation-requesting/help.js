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
		const ArrayOrString = client.Methods.ArrayOrString;
		const Randomized = client.Methods.Randomized;

		const source = await client.GuildDatabase.get(message.guild);
		const prefix = source.prefix;
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
				const CategoryKeyword = category.keywords[0];
				const length = category.commands.length;

				if (CategoryKeyword === 'settings') return embed.addField(`Internal Settings \`${CategoryKeyword}\``, `${settingsOptions.size} available setting${settingsOptions.size > 1 ? 's' : ''}`);
				embed.addField(`${category.name} \`${CategoryKeyword}\``, `${length > 0 ? `contains ${length} command${length > 1 ? 's' : ''}` : 'No command found.'}`, true);
			});

			const tips = Randomized(responses.tips);
			if (tips.length > 0) embed.setFooter(`Tip: ${tips}`);
			return message.channel.send(embed);
		}

		if (args[0])
		{
			args[0] = args[0].toLowerCase();

			if (args[0].startsWith('help'))
			{
				return client.emit('message', Object.assign(message, { content: `${prefix}help` }));
			}

			let allCategories = [];
			let target;
			let onCategory = false;

			client.CommandCategories.forEach(t => {
				allCategories = allCategories.concat(t.keywords);
			});

			if (allCategories.some(i => i === args[0]))
			{
				target = client.CommandCategories.find(index => index.keywords && index.keywords.some(i => i === args[0]));
				onCategory = true;
			}
			else target = client.CommandList.get(args[0]) || client.CommandList.find(cmd => cmd.aliases && cmd.aliases.includes(args[0]));

			// If category
			if (target !== undefined && onCategory === true)
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
					const timeOutOptions = async (msg, time) => {
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
						if (response === undefined) return;
						if (response.size > 0)
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
						if (response.size === 0 && user.timeout - now > 0 && check)
						{
							await timeOutOptions(message, user.timeout);
							await send();
						}
						return;
					};
					await timeOutOptions(message, user.timeout);
					await send();

					return;
				}
				else
				{
					const embed = new EmbedConstructor()
										.setTitle(`Category: ${target.name}`)
										.setColor(target.colorCode)
										.setFooter(`Available: ${target.commands.length} command${target.commands.length > 1 ? 's' : ''}`);

					let descString = `${target.keywords.length > 1 ? `**Aliases:** \`${target.keywords.join(', ')}\`\n` : ''}*${target.descriptions && target.descriptions.length > 0 ? target.descriptions : 'No description available, yet!'}*\n`;
					const limit = 10;
					if (target.commands.length > limit)
					{
						const array = [];
						target.commands.forEach(command => {
							array.push(`\`${command}\``);
						});
						array.sort();
						descString += `**Available commands:** \n ${array.join(', ')}`;
					}

					else
					{
						target.commands.forEach(command => {
							const cmd = client.CommandList.get(command);
							descString += `\n \`${cmd.name}\` ${target.underDev.some(n => n === cmd.name) ? '`| Under Developement*`' : ''}\n- ${cmd.description || 'No description provided. Kinda shady...'}`;
						});
					}

					const tips = Randomized(responses.tips);
					embed.setDescription(descString);
					embed.setFooter(`Current prefix: ${prefix}${tips.length > 0 ? `\nTip: ${tips}` : ''}`);
					return message.channel.send(embed);
				}
			}

			// If command
			else if (target !== undefined && onCategory === false)
			{
				// Initial properties
				const name = target.name;
				const aliases = target.aliases || 'None';
				const desc = target.description && target.description.length > 0 ? target.description : 'No description available, yet!';
				const flags = target.flags || [];
				const cooldown = target.cooldown;
				const group = target.group;
				const guildOnly = target.guildOnly || false;
				const guildCooldown = target.guildCooldown || false;
				const master_explicit = target.master_explicit;

				// Usage
				const usage = target.usage || '`Passive | No input needed.`';
				const detailedUsage = target.usageSyntax || null;
				const usageString = toUsageString(usage, prefix, name, flags, client);
				let usageStringWithSyntax = toUsageString(detailedUsage, prefix, name, flags, client);
				if (usageStringWithSyntax.length < usageString.length) usageStringWithSyntax = usageString;

				// Usage parameters
				const reqPLeft = message.client.Methods.StringSearch(/\|</g, usageStringWithSyntax);
				const optPLeft = message.client.Methods.StringSearch(/\|\[/g, usageStringWithSyntax);
				const reqPRight = message.client.Methods.StringSearch(/>\|/g, usageStringWithSyntax);
				const optPRight = message.client.Methods.StringSearch(/]\|/g, usageStringWithSyntax);

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
				const perms = permSet.output;
				const permIsArray = permSet.boolean;
				const permsString = `Required permissions: \`${permIsArray ? `${perms.join(', ')}` : perms}\``;

				// User
				const userSet = ArrayOrString(target.reqUser || '');
				const user = userSet.output;
				const userIsArray = userSet.boolean;

				// Notes
				const noteSet = ArrayOrString(target.notes || '');
				const notes = noteSet.output;
				const noteIsArray = noteSet.boolean;

				const embed = new EmbedConstructor()
				.setColor('RANDOM')
				.setTitle(`[${Array.isArray(group) ? `${group.join(', ')}` : group}] ` + `\`${name}\``)
				.setDescription(`${flags.some(n => n === 'Under Developement') ? '**[Under Development!]** __This command may not running as expected.__' : ''}\n*${desc}${perms.length > 0 ? `\n${permsString}*` : '*'}`);
				if (aliases !== 'None') embed.addField(`${Randomized(responses.commands.command_aliases)}`, `\`${Array.isArray(aliases) ? aliases.join(', ') : aliases}\``);

				embed.addField(`Usage`, `${target.usage ? `${usageString}` : usage}` + `${requiredParams.length > 0  ? `\n\`<> ${requiredParams.join(', ')}\`` : ''}${optionalParams.length > 0 ? `\n\`[] ${optionalParams.join(', ')}\`` : ''}` + `${notes.length > 0 ? `\n${noteIsArray ? `**Extra notes:**\n*${notes.join('\n')}*` : `**Extra notes:** *${notes}*`}` : ''}`)
							.addField('Command availability:', `${master_explicit ? 'Master dedicated ~' : `${guildOnly ? `${user.length > 0 ? `[Guild only] ${userIsArray ? user.join(', ') : user}` : 'Guild only.'}` : client.Methods.Randomized(responses.commands.command_availability)}`}`, true)
							.addField('Cooldown', `${cooldown > 0 ? `${cooldown ? `${cooldown} second${cooldown > 1 ? 's' : ''}` : 'None'}` : 'None'}${guildCooldown ? ', guild' : ''}`, true)
							.setFooter(`${requiredParams.length > 0  ? `${optionalParams.length > 0 ? '<> required parameters' : '<> required parameters |'}` : ''}${optionalParams.length > 0 ? `${requiredParams.length > 0 ? ', [] optional parameters |' : '[] optional parameters |'}` : ''} Current prefix: ${prefix}`);

				return message.channel.send(embed);
			}
			else return message.channel.send('Unknown category or command.');
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
			usageArray.push(`\`${prefix}${name} ${i}\`${flags ? `\`| ${client.Methods.joinArrayString(flags)}\`` : ''}`);
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