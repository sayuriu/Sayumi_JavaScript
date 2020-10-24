module.exports = {
	name: 'whois',
	description: '',
	group: [],
	guildOnly: true,
	cooldown: 10,
	args: true,
	usage: '[user?: direct tag / ID]',
	onTrigger: async (message, args, client) => {
		if (!args[0]) args[0] = `<@!${message.author.id}>`;

		let _id;
		let confirm = false;

		const userID = args[0].match(/^<?@?!?(\d+)>?$/);
		if (userID !== null)
		{
			_id = userID[1];
			confirm = true;
		}
		else if (!userID) _id = null;
		const target = message.guild.members.cache.find(user => confirm ? user.id === _id : user.name === args[1]);

		if (!target) return message.channel.send('No such user matches your request.');

		return message.channel.send(client.Embeds.userInfo(message, target));
	},
};