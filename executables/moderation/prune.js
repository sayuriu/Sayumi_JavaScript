const log = (require('../../utils/Logger'));

module.exports = {
	name: "prune",
	description: "Prune messages from a channel, up to 99 messages.",
	stable: true,
	group: 'Moderation',
	reqPerms: 'MANAGE_MESSAGES',
	reqUser: 'Message Manager',
	guildOnly: true,
	args: true,
	reqArgs: true,
	usage: "<number>",
	prompt: "Please tell me how many messages you want to prune.",
	onTrigger: (message, args) => {
		const amount = parseInt(args[0]) + 1;

		if (isNaN(amount)) {
			return message.reply('that doesn\'t seem to be a valid number.');
		} else if (amount <= 1 || amount > 100) {
			return message.channel.send('The amount specified must be between 1 and 100.');
		}

		message.channel.bulkDelete(amount, true).catch(err => {
			log.error(`${err.message}\n${err.stack}`);
			message.channel.send('There was an error trying to prune messages in this channel.').then(m => m.delete({ timeout: 4000 }));
		});
	},
};