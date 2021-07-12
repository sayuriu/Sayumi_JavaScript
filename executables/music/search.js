const { MessageEmbed: EmbedConstructor } = require('discord.js');
const { music: { embed: { searching } } } = require('../../utils/json/Responses.json');

module.exports = {
	name: 'msearch',
	aliases: ['ms, music-s, mlookfor'],
	group: ['Music'],
	reqPerms: ['CONNECT', 'SPEAK'],
	onTrigger: async (message, args, client) => {
		const m = await message.channel.send(
			new EmbedConstructor({
				title: client.Methods.Common.Randomize(searching),
				description: `Query: \`${args.join(' ')}\``,
			}),
		).catch(() => null);
		message.searchEmbed = m;
		client.MusicPlayer.play(message, args.join(" "), false);
	},
};