const { MessageEmbed: EmbedConstructor } = require('discord.js');

module.exports = {
	name: 'messageUpdate',
	stable: true,
	onEmit: async (client, oldMessage, newMessage) => {
		if (oldMessage.content === newMessage.content) return;

		const data = await client.GuildDatabase.get(oldMessage.guild);

		const LogChannel = oldMessage.guild.channels.cache.find(ch => ch.id === data.MessageLogChannel);
		if (data.MessageLogState && LogChannel)
		{

		}
	},
};