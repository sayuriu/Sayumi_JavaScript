module.exports = {
	name: 'server',
	description: 'Get the info of the current server.',
	guildOnly: true,
	gruop: ['Information'],
	cooldown: 60,
	onTrigger: async (message, client) => {
		const embed = await client.Embeds.serverInfo(message);
		return message.channel.send(embed);
	},
};

