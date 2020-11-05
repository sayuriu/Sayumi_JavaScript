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
	terminal: true,
	master_explicit: true,
	usage: '<input>',
	onTrigger: async (message, prefix) => {

		let input = message.content.slice(prefix.length + 5);
		input = input.replace(/^`+(js)?/, '')
							.replace(/`+$/, '');

		try
		{
			const processed = eval(input);
			let output = util.inspect(processed, false, null, false);
			const startTime = process.hrtime();
			const diffTime = process.hrtime(startTime);

			let outputType = (typeof processed).toString();
			if (outputType === 'undefined') outputType = 'statement';
			outputType = outputType.replace(outputType.substr(0, 1), outputType.substr(0, 1).toUpperCase());

			if (output.length > 1024)
			{
				fs.writeFileSync(`./temps/${message.author.id}`, JSON.stringify(processed, null, 4));
				throw new RangeError('The output is longer than 1024 characters.');
			}

			const embed = new EmbedConstructor()
									.setTitle('Terminal')
									.setColor('#5acc61')

									.addField('Input', `\`\`\`js\n${beautify(input, { format: 'js' })}\n\`\`\``)
									.addField('Output', `\`\`\`js\n${output}\n\`\`\``)

									.setFooter(`[${outputType}] | Executed in ${diffTime[0] > 0 ? `${diffTime}s` : ""}${diffTime[1] / 1000000}ms`)
									.setTimestamp();

			return message.channel.send(embed);
		}
		catch (error)
		{
			const embed = new EmbedConstructor()
									.setTitle('Terminal')
									.setColor('#fa3628')

									.addField('Input', `\`\`\`js\n${beautify(input, { format: 'js' })}\n\`\`\``)
									.addField('Error', `\`[${error.name}] ${error.message}\``)

									.setTimestamp();

			embed.addField('Stack', `\`\`\`xl\n${error.stack}\n\`\`\``);
			message.channel.send(embed);

			if (fs.existsSync(`./temp/${message.author.id}`)) return message.channel.send(new MessageAttachment(fs.readFileSync(`./temp/${message.author.id}`), message.author.id + `.json`));
		}
	},
};