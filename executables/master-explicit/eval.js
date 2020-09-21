const beautify = require('beautify');
const { MessageEmbed: EmbedConstructor } = require('discord.js');

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

		const input = message.content.slice(prefix.length + 4);

		try
		{
			const output = eval(input);
			const startTime = process.hrtime();
			const diffTime = process.hrtime(startTime);

			let outputType = (typeof output).toString();
			if (outputType === undefined) outputType = 'statement';
			outputType = outputType.replace(outputType.substr(0, 1), outputType.substr(0, 1).toUpperCase());

			const embed = new EmbedConstructor()
									.setTitle('Terminal')
									.setColor('green')

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
									.setColor('red')

									.addField('Input', `\`\`\`js\n${beautify(input, { format: 'js' })}\n\`\`\``)
									.addField('Error', `\`[${error.name}] ${error.message}\``)

									.setTimestamp();

			embed.addField('Stack', `\`\`\`xl\n${error.stack}\n\`\`\``);
			return message.channel.send(embed);

		}
	},
};