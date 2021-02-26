const { Check } = require('../../utils/Music');

module.exports = {
	name: 'mnowplaying',
	aliases: ['mnp', 'np'],
	group: ['Music'],
	stable: true,
	guildOnly: true,
	onTrigger: (message, client) => {
		if (!Check(message)) return;
		const Instance = client.MusicInstances.get(message.guild.id);
		if (Instance) return message.channel.send(Instance.GetNowPlaying(0));

		message.channel.send('There\'s no active playback yet. Try `mplay` and add some sound!');
	},
};