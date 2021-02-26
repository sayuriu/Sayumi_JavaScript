const { SearchVideos, Check, MusicInstance } = require('../../utils/Music');

module.exports = {
	name: 'mjoin',
	group: ['Music'],
	stable: true,
	reqArgs: true,
	guildOnly: true,
	reqPerms: ['CONNECT', 'SPEAK'],
	onTrigger: async (message, client) => {
		if (!Check(message)) return;
		if (client.MusicInstances.get(message.guild.id)) return message.channel.send('Already joined a voice channel!');

		return message.member.voice.channel.join().then(connection =>
			new MusicInstance({ voiceChannel: message.member.voice.channel, textChannel: message.channel }, connection),
		);
	},
};