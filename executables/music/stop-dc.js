const { Check } = require('../../utils/Music');

module.exports = {
	name: 'dc',
	aliases: ['mdc'],
	group: ['Music'],
	stable: true,
	guildOnly: true,
	onTrigger: (message, client) => {
		if (!Check(message)) return;
		const Instance = client.MusicInstances.get(message.guild.id);
		if (Instance) return Instance.destroy();

		message.channel.send('What am I supposed to disconnect from?');
	},
};