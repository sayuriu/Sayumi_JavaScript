const beautify = require('beautify');
const util = require('util');
const fs = require('fs');
const { MessageEmbed: EmbedConstructor, MessageAttachment } = require('discord.js');

module.exports = {
	name: 'eval',
	description: 'Execute literally anything, directly through the command line. \nSounds scary.',
	cooldown: 0,
	stable: true,
	args: true,
	reqArgs: true,
	group: 'Utilities',
	flags: ['Under Developement'],
	terminal: true,
	master_explicit: true,
	usage: '[-showHidden?] <input>',
	onTrigger: async (message, prefix) => {

		let input = message.content.slice(prefix.length + 5);
		let showHidden = false;

		const flag_showHidden = input.match(/^-?(showHidden|showhidden|sh|SH)?/);
		if (flag_showHidden[0].length > 0)
		{
			input = input.replace(/^-?(showHidden|showhidden|sh|SH)?/, '');
			showHidden = true;
		}
		input = input.replace(/^`+(js)?/, '').replace(/`+$/, '');

		try
		{
			const processed = eval(input);
			let output = util.inspect(processed, showHidden, null, false);
			const startTime = process.hrtime();
			const diffTime = process.hrtime(startTime);

			let ExceedLimit = false;

			let outputType = (typeof processed).toString();
			if (outputType === 'undefined') outputType = 'statement';
			outputType = outputType.replace(outputType.substr(0, 1), outputType.substr(0, 1).toUpperCase());

			if (output.indexOf('{') > -1 && output.endsWith('}'))
			{
				const header = output.substr(0, output.indexOf('{') - 1);
				if (header.toLowerCase().includes(outputType.toLowerCase()))
				{
					outputType = `[${header}]`;
					outputType = outputType
										.replace(/^\[+/, '')
										.replace(/]+$/, '');
				}
				else outputType += `: ${header}`;
			}

			if (output.length > 1024)
			{
				const JSONObjectString = JSON.stringify(processed, null, 4);

				if (JSONObjectString.length <= 1024) output = util.inspect(JSON.parse(JSONObjectString), false, null, false);
				else
				{
					fs.writeFileSync(`./temps/${message.author.username}-${message.createdTimestamp}`, JSONObjectString);
					output = 'The output is longer than length limit. Compiling output into a file...';
					ExceedLimit = true;
				}
			}

			const embed = new EmbedConstructor()
									.setTitle('Terminal')
									.setColor('#5acc61')

									.addField('Input', `\`\`\`js\n${beautify(input, { format: 'js' })}\n\`\`\``)
									.addField('Output', `\`\`\`js\n${output}\n\`\`\``)

									.setFooter(`[${outputType}] | Executed in ${diffTime[0] > 0 ? `${diffTime}s` : ""}${diffTime[1] / 1000000}ms`)
									.setTimestamp();

			message.channel.send(embed).then(sent => {
				if (ExceedLimit && fs.existsSync(`./temps/${message.author.username}-${message.createdTimestamp}`))
				{
					const canAttach = message.guild.me.permissions.has('ATTACH_FILES');
					output = canAttach ? 'Compiling complete.' : 'I have completed compiling it, but I can\'t send the file...';
					const editedEmbed = new EmbedConstructor()
						.setTitle('Terminal')
						.setColor(canAttach ? '#5acc61' : '#f5a142')

						.addField('Input', `\`\`\`js\n${beautify(input, { format: 'js' })}\n\`\`\``)
						.addField('Output', `\`\`\`\n${output}\n\`\`\``)

						.setFooter(`[${outputType}] | Executed in ${diffTime[0] > 0 ? `${diffTime}s` : ""}${diffTime[1] / 1000000}ms`)
						.setTimestamp();

					sent.edit(editedEmbed);
					if (canAttach)
					{
						const { hour, minute, second } = message.client.Methods.TimestampToTime(message.createdTimestamp);
						const timestampString = `${hour}${minute}${second}`;
						message.channel.send(new MessageAttachment(fs.readFileSync(`./temps/${message.author.username}-${message.createdTimestamp}`), `${message.author.username} eval[${timestampString}].json`));
					}
				}
			});

		}
		catch (error)
		{
			const errorName = error.name;

			const stack = error.stack.substr(error.stack.indexOf('at'), error.stack.length);
			const embed = new EmbedConstructor()
									.setTitle('Terminal')
									.setColor('#fa3628')

									.addField('Input', `\`\`\`js\n${beautify(input, { format: 'js' })}\n\`\`\``)
									.addField('Error', `\`[${errorName}] ${error.message}\``)

									.setTimestamp();

			message.channel.send(embed);

			const stackEmbed = new EmbedConstructor()
												.setColor('#bdbdbd')
												.setDescription('*`Do you want to show the stack?`*');

			message.channel.send(stackEmbed).then(async sent => {
				await sent.react('👍');
				await sent.react('✋');
				await sent.awaitReactions(filter, { max: 1, time: 15000, errors: ['time'] })
					.then(async received => {
						const reaction = await received.first();
						if (reaction._emoji.name === '👍')
						{
							const updated = new EmbedConstructor()
														.addField('Stack', `\`\`\`xl\n\t${stack}\n\`\`\``)
														.setFooter(`[${errorName.toString('hex')}]`);
							sent.edit(updated);
						}
						if (reaction._emoji.name === '✋') return sent.delete();
					}).catch(i => {
						sent.delete();
					});
			});
		}

		const filter = (reaction, user) => {
			return ['👍', '✋'].includes(reaction.emoji.name) && user.id === message.author.id;
		};
	},
};

