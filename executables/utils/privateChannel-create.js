module.exports = {
	name: 'createprivate',
	aliases: ['addprivate', 'newpch', 'newprivate'],
	description: 'Create a new private channel.',
	reqPerms: ['MANAGE_CHANNELS', 'MANAGE_ROLES'],
	stable: false,
	reqUser: ['Channel Manager', 'Roles Manager'],
	group: ['Server Management', 'Utilities'],
	guildOnly: true,
	args: true,
	usage: '[<type> <name>]',
	notes: 'By default is a text channel with a name `private`!',
	onTrigger: (message, args, client) => {
		let channelType = args[0];
		if (!channelType) channelType = 'text';
		const validTypes = ['text', 'voice'];
		if (channelType)
		{
			channelType = channelType.toLowerCase();
			if (!validTypes.some(i => i === channelType)) return message.channel.send('The type must be either text or voice.');

			let channelName = args[1];
			if (!args[1] || args[1] === '') channelName = 'private';
			channelName = channelName.toLowerCase();

			message.guild.createChannel(channelName, { type: channelType }, [
				{
					id: message.guild.id,
					deny: ['VIEW_CHANNEL'],
				},
				{
					id: message.author.id,
					allow: ['VIEW_CHANNEL'],
				},
				{
					id: client.user.id,
					allow: ['VIEW_CHANNEL'],
				},
			])
			.then(() => message.channel.send(`Successfully created a private ${channelType} channel.`).then(m => m.delete(4000)))
			.catch(console.error);
		}
	},
};