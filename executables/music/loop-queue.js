const { Check } = require('../../utils/Music');

module.exports = {
	name: 'loopqueue',
	aliases: ['mlq'],
	group: ['Music'],
	stable: true,
	guildOnly: true,
	onTrigger: (message, client) => {
		if (!Check(message)) return;
		const Instance = client.MusicInstances.get(message.guild.id);
		if (Instance) return Instance.Toggle('loop-queue');
		message.channel.send('Looping void...');
	},
};