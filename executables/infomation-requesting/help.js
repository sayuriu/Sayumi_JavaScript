const { MessageEmbed: EmbedConstructor } = require('discord.js');
const guildActions = new (require('../../utils/Database/Methods/guildActions'));

module.exports = {
	name: 'help',
	aliases: ["holp", "helps", "?"],
	args: true,
	description: 'A help command for those in need.',
	groups: ['Information'],
	cooldown: 10,
	usage: '[category? command]',
	onTrigger: async (message, args, client) => {
		const source = await guildActions.guildGet(message.guild);
		const prefix = source.prefix;

		if (!args.length)
		{
			// Categories
			const embed = new EmbedConstructor()
									.setColor('RANDOM')
									.setTitle("Help [Cagetories]")
									.setDescription(`*To see commands in a specified cagetory, type \`${prefix}help <cagetoryName>\` for more info.*`);

			client.CommandCategories.forEach(category => {
				const CategoryKeywords = category.keywords[0];
				const length = category.commands.length;
				embed.addField(`${category.name} \`${CategoryKeywords}\``, `${length > 0 ? `contains ${length} command${length > 1 ? 's' : ''}` : 'No command found.'}`, true);
			});

			return message.channel.send(embed);
		}

		if (args[0])
		{
			let allCategories = [];
			client.CommandCategories.forEach(t => {
				allCategories = allCategories.concat(t.keywords);
			});
			let target;
			let onCategory = false;
			args[0] = args[0].toLowerCase();

			if (allCategories.some(i => i === args[0]))
			{
				target = client.CommandCategories.find(index => index.keywords && index.keywords.some(i => i === args[0]));
				onCategory = true;
			}
			else target = client.CommandList.get(args[0]) || client.CommandList.find(cmd => cmd.aliases && cmd.aliases.includes(args[0]));

			// If category
			if (target !== undefined && onCategory === true)
			{
				const embed = new EmbedConstructor()
										.setTitle(`Category: ${target.name}`)
										.setColor(target.colorCode)
										.setFooter(`Available: ${target.commands.length} command${target.commands.length > 1 ? 's' : ''}`);

				let descString = `${target.keywords.length > 1 ? `Aliases: \`${target.keywords.join(', ')}\`\n` : ''}*${target.descriptions && target.descriptions.length > 0 ? target.descriptions : 'No description available, yet!'}*\n`;
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
						descString += `\n \`${cmd.name}\`\n- ${cmd.description}`;
					});
				}

				embed.setDescription(descString);
				return message.channel.send(embed);
			}

			// If command
			else if (target !== undefined && onCategory === false)
			{
				const name = target.name;
				const aliases = target.aliases || 'None';
				const desc = target.description && target.description.length > 0 ? target.description : 'No description available, yet!';
				const cooldown = target.cooldown;
				const group = target.group;
				const guildOnly = target.guildOnly || false;
				const guildCooldown = target.guildCooldown || false;
				const notes = target.notes || '';
				const user = target.reqUser;
				const master_explicit = target.master_explicit;

				let usage = target.usage || 'Passive | No input needed.';
				let usageIsArray = false;
				if (Array.isArray(usage))
				{
					const usageArray = [];
					target.usage.forEach(i => {
						usageArray.push(`\`${prefix + i}\``);
					});
					if (usageArray.length === 1) usage = usageArray[0];
					else
					{
						usage = usageArray;
						usageIsArray = true;
					}
				}

				let perms = target.reqPerms || '';
				let permIsArray = false;
				if (Array.isArray(perms))
				{
					const permsArray = [];
					target.reqPerms.forEach(i => {
						permsArray.push(i.toString());
					});
					if (permsArray.length === 1) perms = permsArray[0];
					else
					{
						perms = permsArray;
						permIsArray = true;
					}
				}
				const permsString = `Required permissions: \`${permIsArray ? `${perms.join(', ')}` : perms}\``;

				const embed = new EmbedConstructor()
				.setColor('RANDOM')
				.setTitle(`[${Array.isArray(group) ? `${group.join(', ')}` : group}] ` + `\`${name}\``)
				.setDescription(`*${desc}${perms.length > 0 ? `\n${permsString}*` : '*'}`)
				.addField('Other ways to issue this command:', `${Array.isArray(aliases) ? aliases.join(', ') : aliases}`, true)
				.addField('Usage:', `${usageIsArray ? usage.join('\n') : usage}` + `\n${notes}`)
				.addField('Command availability:', `${master_explicit ? 'Master dedicated ~' : `${guildOnly ? `${user.length > 0 ? `[Guild only] ${user}` : 'Guild only.'}` : 'Everywhere, expect voice.'}`}`, true)
				.addField('Cooldown', `${cooldown ? `${cooldown} second${cooldown > 1 ? 's' : ''}` : '3 seconds'}${guildCooldown ? ', guild' : ''}`, true)
				.setFooter(`[] means optional (or none), <> means required.`);

				return message.channel.send(embed);
			}
			else return message.channel.send('Unknown category or command.');
		}
	},
};