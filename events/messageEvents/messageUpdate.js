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
			const updated = new EmbedConstructor()
                                .setTitle('Edited message')
                                .setDescription(`<@!${oldMessage.author.id}> \`ID [${oldMessage.author.id}]\` has edited a message in <#${oldMessage.channel.id}>`)
                                .setColor('#f7700f')
                                .addField('Original', oldMessage.content)
                                .addField('Edited', newMessage.content)
								.setTimestamp();

			LogChannel.send(updated).then(m => {
				Object.assign(m, { editedFlag: newMessage.id });
				// Object.assign(newMessage, { editedFlag: newMessage.id });
			});
		}
	},
};