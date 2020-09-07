module.exports = {
	name: 'createprivate',
	aliases: ['addprivate', 'newpch', 'newprivate'],
	description: 'Create a new private channel.',
	reqPerms: 'MANAGE_CHANNELS',
	reqUser: 'Channel Manager',
	group: 'Server Management',
	guildOnly: true,
	issue(message, args) {
		if (!message.member.permissions.has('MANAGE_CHANNELS', 'MANAGE_ROLES')) {
			message.channel.send("You're lacking permissions to do that.");
			return;
		}
		if (!message.guild.me.permissions.has('MANAGE_CHANNELS', 'MANAGE_ROLES')) {
			message.channel.send("Missing permission.");
			return;
		}
		const channel = {
			name: "",
			type: "",
		};
		channel.name = args[0];
		if (!args[0]) {
			channel.name = "private";
		}
		if (message.guild.channels.some(c => c.name === channel.name)) {
			message.reply(`a channel with the name \`${channel.name}\` already exsist.`);
			return;
		}

		channel.type = args[1];
		if (args[1] !== undefined
			&& args[1] !== ""
			&& args[1] !== "text"
			&& args[1] !== "voice"
			&& args[1] !== "cagetory"
			&& args[1] !== "news"
			&& args[1] !== "store") {
			message.reply("that doesn't seems to be a valid channel type.");
			return;
		}
		if (args[1] === "" || args[1] === undefined) {
			channel.type = "text";
		}
		message.guild.createChannel(channel.name, { type: channel.type }, [
			{
				id: message.guild.id,
				deny: ['VIEW_CHANNEL'],
			},
			{
				id: message.author.id,
				allow: ['VIEW_CHANNEL'],
			},
			{
				id: "530044410050772992",
				allow: ['VIEW_CHANNEL'],
			},
		])
			.then(() => message.channel.send(`Successfully created a private ${channel.type} channel.`).then(m => m.delete(4000)))
			.catch(console.error);
	},
};