const FileSystem = require('fs');
const { MessageEmbed: EmbedConstructor } = require('discord.js');

module.exports = {
	name: 'clear',
	description: 'Sweeping time!',
	stable: true,
	cooldown: 0,
	master_explicit: true,
	args: true,
	reqArgs: true,
	usage: '<option> [-associatedOptionFlags]',
	group: 'Utilities',
	onTrigger: (message, args) => {
		if (!args[0])
		{
			const embed = new EmbedConstructor();
		}
		args[0] = args[0].toLowerCase();

		switch (args[0])
		{
			case 'log':
			{
				if (args[1] && args[1].startsWith('-'))
				{
					switch (args[1].toLowerCase())
					{
						case '-error':
						{
							FileSystem.writeFile('./logs/errors.log', '', (err) => {
								if (err) return message.channel.send(`Error occured!\n\`${err.message}\``);
							});
							message.channel.send('Log cleared!').then(m => m.delete({ timeout: 3000 }));
							break;
						}
						case '-log':
						{
							FileSystem.writeFile('./logs/log.log', '', (err) => {
								if (err) return message.channel.send(`Error occured!\n\`${err.message}\``);
							});
							message.channel.send('Log cleared!').then(m => m.delete({ timeout: 3000 }));
							break;
						}
						case '-all':
						{
							FileSystem.writeFile('./logs/log.log', '', (err) => {
								if (err) return message.channel.send(`Error occured!\n\`${err.message}\``);
							});
							FileSystem.writeFile('./logs/errors.log', '', (err) => {
								if (err) return message.channel.send(`Error occured!\n\`${err.message}\``);
							});
							message.channel.send('Log cleared!').then(m => m.delete({ timeout: 3000 }));
							break;
						}
						default: return message.channel.send('Invalid or wrong flags.');
					}
				} else if (!args[1]) {
					FileSystem.writeFile('./logs/log.log', '', (err) => {
						if (err) return message.channel.send(`Error occured!\n\`${err.message}\``);
					});
					FileSystem.writeFile('./logs/errors.log', '', (err) => {
						if (err) return message.channel.send(`Error occured!\n\`${err.message}\``);
					});
					message.channel.send('Log cleared!').then(m => m.delete({ timeout: 3000 }));
					break;
				}
				break;
			}

			case 'tempfiles':
			{
				if (FileSystem.lstatSync('./temps').size <= 0) return message.channel.send('There are no files to clean up.');
				FileSystem.rmdir('./temps', (err) => {
					if (err) return message.channel.send(`Error occured!\n\`${err.message}\``);
				});
				FileSystem.mkdir('./temps', (err) => {
					if (err) return message.channel.send(`Error occured!\n\`${err.message}\``);
				});
				message.channel.send('Cache files cleared.').then(m => m.delete({ timeout: 3000 }));
				break;
			}

			default: return message.channel.send('Invalid option.');
		}
		return;
	},
};