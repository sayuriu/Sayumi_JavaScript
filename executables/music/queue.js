const { Check } = require('../../utils/Music');

module.exports = {
	name: 'mqueue',
	aliases: ['mque'],
	group: ['Music'],
	stable: true,
	args: true,
	guildOnly: true,
	onTrigger: (message, args, client) => {
		if (!Check(message)) return;
		const Instance = client.MusicInstances.get(message.guild.id);
		if (Instance)
		{
			const embeds = Instance.GetQueue();
			let index = parseInt(args[0]);
			if (isNaN(index)) index = 0;
			if (index > embeds.length) index = embeds.length - 1;

			return message.channel.send(embeds[index]);
		}

		message.channel.send('There\'s no active playback yet. Try `mplay` and add some sound!');
	},
};