module.exports = {
	name: 'logclear',
	description: 'Clear the logs!',
	stable: true,
	cooldown: 0,
	master_explicit: true,
	args: true,
	usage: '[type?] , with \'type\' = [\'error\' | \'log\']',
	group: 'Utilities',
	onTrigger: (message, args) => {
		const FileSystem = require('fs');
		if (args[0]) args[0] = args[0].toLowerCase();
		switch (args[0])
		{
			case 'error':
			{
				FileSystem.writeFile('./logs/errors.log', '', (err) => {
					if (err) return message.channel.send(`Error occured!\n\`${err.message}\``);
				});
				message.channel.send('Log cleared!');
				break;
			}
			case 'log':
			{
				FileSystem.writeFile('./logs/log.log', '', (err) => {
					if (err) return message.channel.send(`Error occured!\n\`${err.message}\``);
				});
				message.channel.send('Log cleared!');
				break;
			}
			default:
			{
				FileSystem.writeFile('./logs/log.log', '', (err) => {
					if (err) return message.channel.send(`Error occured!\n\`${err.message}\``);
				});
				FileSystem.writeFile('./logs/errors.log', '', (err) => {
					if (err) return message.channel.send(`Error occured!\n\`${err.message}\``);
				});
				message.channel.send('Log cleared!');
				break;
			}
		}
		return;
	},
};