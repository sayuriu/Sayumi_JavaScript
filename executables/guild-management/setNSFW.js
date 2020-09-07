module.exports = {
	name: 'nsfw',
	aliases: ['r18', 'setnsfw'],
	description: "Toggles NSFW setting for this channel.",
	guildOnly: true,
	stable: true,
	args: true,
	reqPerms: 'MANAGE_CHANNELS',
	reqUser: 'Channel Manager',
	group: ['Server Management'],
	usage: '[boolean?]',
	notes: 'Actually you can just type this command without the args to toggle the setting.',
	onTrigger: (message, args) => {
		if (!args[0])
		{
			if (!message.channel.nsfw) {
				message.channel.setNSFW(true);
				return message.channel.send('true');
			}
			if (message.channel.nsfw) {
				message.channel.setNSFW(false);
				return message.channel.send('false');
			}
		}

		const valid = [undefined, 'true', 'false'];
		if (!valid.some(i => i === args[0])) {
			message.channel.send(`Invalid argument${args.size > 1 ? "s" : ""}.`);
			return;
		}

		if (args[0] === "true") {
			if (!message.channel.nsfw) {
				message.channel.setNSFW(true);
			} else {
				message.reply("this channel is already NSFW.");
				return;
			}
		}
		if (args[0] === "false") {
			if (!message.channel.nsfw) {
				message.reply("this channel is already for everyone.");
			} else {
				message.channel.setNSFW(false);
			}
		}
	},
};