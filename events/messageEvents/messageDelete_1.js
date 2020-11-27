const { MessageEmbed: EmbedConstructor } = require('discord.js');

module.exports = {
	name: 'messageDelete',
	stable: true,
	onEmit: async (client, message) => {

		if (message.channel.type === 'dm') return;
	},
};