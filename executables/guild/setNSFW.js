module.exports = {
	name: 'nsfw',
	aliases: ['r18', 'setnsfw'],
	description: "Toggles NSFW setting for this channel.",
	guildOnly: true,
	args: true,
	reqArgs: true,
	group: ['Server Management'],
	usage: '[boolean]',
	onTrigger: (message, args) => {
		if (!message.member.permissions.has("MANAGE_CHANNELS"))
		{
			message.reply("you're lacking permissions.").then(m => m.delete(5000));
			return;
		}
		if (!message.guild.me.permissions.has("MANAGE_CHANNELS"))
		{
			message.channel.send("Missing permissions.").then(m => m.delete(5000));
			return;
		}
		if (!args[0])
		{
			if (!message.channel.nsfw) {
				message.channel.setNSFW(true);
			}
			if (message.channel.nsfw) {
				message.channel.setNSFW(false);
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