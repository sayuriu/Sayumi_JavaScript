module.exports = {
	name: 'server',
	description: '',
	guildOnly: true,
	cooldown: 60,
	onTrigger: async (message, client) => {
		const embed = await client.Embeds.serverInfo(message);
		return message.channel.send(embed);
	},
};