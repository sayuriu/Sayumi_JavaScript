const { MessageEmbed: EmbedConstructor } = require('discord.js');

module.exports = {
	name: 'noResults',
	music: true,
	onEmit: (_, message, queue) => {
		if (message.searchEmbed)
		{
			const embed = message.searchEmbed.embeds[0];
			if (embed)
			{
				embed.description = 'No result was found for your query.';
				if (!message.searchEmbed.deleted) queue.searchMessage.edit(embed);
				else message.channel.send('No result was found for your query.');
				return delete message.searchEmbed;
			}
		}
		message.channel.send('No result was found for your query.');
	},
};