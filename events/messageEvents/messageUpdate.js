module.exports = {
	name: 'messageUpdate',
	stable: true,
	onEmit: async (client, oldMessage, newMessage) => {
		if (oldMessage.content === newMessage.content) return;
		else
		{
			const data = await client.GuildDatabase.get(oldMessage.guild);
			const embed = client.Embeds.messageLog(null, null, oldMessage, newMessage);

			if (data.MessageLogState && data.MessageLogChannel !== '')
			{
				client.channels.cache.find(channel => channel.id === data.MessageLogChannel).send(embed.updated);
			}
		}
	},
};