const guildActions = new (require('../../utils/Database/Methods/guildActions'));
const embeds = new (require('../../utils/embeds'));

module.exports = {
	name: 'messageUpdate',
	stable: true,
	onEmit: async (client, oldMessage, newMessage) => {
		if (oldMessage.content === newMessage.content) return;
		else
		{
			const data = await guildActions.guildGet(oldMessage.guild);
			const embed = embeds.messageLog(null, null, oldMessage, newMessage);

			if (data.MessageLogState && data.MessageLogChannel !== '')
			{
				client.channels.cache.find(channel => channel.id === data.MessageLogChannel).send(embed.updated);
			}
		}
	},
};