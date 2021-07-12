module.exports = {
	name: 'prefix',
	description: 'Your special prefix to summon me!',
	guildOnly: true,
	args: true,
	reqPerms: 'MANAGE_GUILD',
	reqUser: 'Guild Manager',
	group: 'Settings',
	usage: '[newPrefix?]',
	notes: 'The new prefix must not be longer than 3 characters.',
	onTrigger: async (message, args, client) => {
		const source = await client.Database.Guild.get(message.guild);
		const prefix = source.prefix;
		if (!args?.length) return message.channel.send(`The current prefix is \`${prefix}\``);
		if (args.length)
		{
			if (args[0].length > 3) return message.channel.send('The new prefix can not be longer than 3 characters. Please try again.');
			client.Database.Guild.update(message.guild, { prefix: args[0] });
			return message.channel.send(`The prefix has been updated to \`${args[0]}\``);
		}
	},
};