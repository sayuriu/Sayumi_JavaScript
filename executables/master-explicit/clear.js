const { writeFile, readdirSync, unlinkSync, rmdir, mkdir } = require('fs');
const { MessageEmbed: EmbedConstructor } = require('discord.js');

module.exports = {
	name: 'clear',
	description: 'Sweeping time!',
	cooldown: 0,
	master_explicit: true,
	args: true,
	reqArgs: true,
	usage: '<option> [-associatedOptionFlags]',
	usageSyntax: '|<option: logs | tempfiles>| |[-associatedOptionFlags(logs): errors | logonly | all]|',
	group: 'Utilities',
	onTrigger: (message, args, client) => {
		const SelfDeteleMsg = (msg) => client.Methods.DiscordClient.SelfMessageDelete(msg, { timeout: 3000 });
		if (!args[0])
		{
			const embed = new EmbedConstructor();
		}
		args[0] = args[0].toLowerCase();

		const clearLogs = (file = 'log.log') => {
			writeFile(`./logs/${file}`, '', (err) => {
				if (err)
				{
					message.channel.send(`Error occured!\n\`${err.message}\``);
					return false;
				}
			});
			return true;
		};

		switch (args[0])
		{
			case 'logs':
			{
				if (args[1] && args[1].startsWith('-'))
				{
					switch (args[1].toLowerCase())
					{
						case args[1].toLowerCase().match(/\s-errors?\s*/):
						{
							if (clearLogs('errors.log')) message.channel.send('Error logs cleared!').then(m => SelfDeteleMsg(m));
							break;
						}
						case '-logonly':
						{
							if (clearLogs()) message.channel.send('Log cleared!').then(m => SelfDeteleMsg(m));
							break;
						}
						case '-all':
						{
							if (clearLogs() && clearLogs('errors.log')) message.channel.send('Logs cleared!').then(m => SelfDeteleMsg(m));
							break;
						}
						default: return message.channel.send('Invalid or wrong flags.');
					}
				} else {
					if (clearLogs()) message.channel.send('Log cleared!').then(m => SelfDeteleMsg(m));
					break;
				}
				break;
			}

			case args[0].match(/-errors?/):
			{
				if (clearLogs('errors.log')) message.channel.send('Error logs cleared!').then(m => SelfDeteleMsg(m));
				break;
			}

			case 'tempfiles':
			{
				if (client.Methods.DirSet.GetTotalSize('./temps').startsWith('0')) return message.channel.send('There are no files to clean up.');
				readdirSync('./temps', { encoding: null, flags: 'w+' }).forEach(file => {
					unlinkSync(`./temps/${file}`);
				});
				rmdir('./temps', (err) => {
					if (err) return message.channel.send(`Error occured!\n\`${err.message}\``);
				});
				mkdir('./temps', (err) => {
					if (err) return message.channel.send(`Error occured!\n\`${err.message}\``);
				});
				message.channel.send('Cache files cleared.').then(m => SelfDeteleMsg(m));
				break;
			}

			default: return message.channel.send('Invalid option.');
		}
		return;
	},
};