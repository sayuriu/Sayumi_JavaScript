module.exports = {
	name: 'prefix',
	guildOnly: true,
	cooldown: 15,
	stable: true,
	args: true,
	reqPerms: 'MANAGE_GUILD',
	reqUser: 'Guild Manager',
	group: 'Settings',
	usage: '[newPrefix?]',
	onTrigger: async (message, args, client) => {
		const source = await client.GuildDatabase.get(message.guild);
		const prefix = source.prefix;
		if (!args.length || args.length < 1)
		{
			return message.channel.send(`The current prefix is \`${prefix}\``);
		}
		if (args.length)
		{
			if (args[0].length > 3) return message.channel.send('The new prefix can not be longer than 3 characters. Please try again.');
			client.GuildDatabase.update(message.guild, { prefix: args[0] });
			return message.channel.send(`The prefix has been updated to \`${args[0]}\``);
		}
	},
};