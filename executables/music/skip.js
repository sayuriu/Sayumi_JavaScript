const { Check } = require('../../utils/Music');

module.exports = {
	name: 'mskip',
	aliases: ['msk'],
	group: ['Music'],
	stable: true,
	args: true,
	guildOnly: true,
	onTrigger: (message, args, client) => {
		if (!Check(message)) return;
		const Instance = client.MusicInstances.get(message.guild.id);

		args = isNaN(parseInt(args[0])) ? 0 : parseInt(args[0]);
		if (Instance)
		{
			if (!Instance.queue.length) return message.channel.send('❌`There\'s nothing else in the queue!`');
			if (args > Instance.queue.length) return message.channel.send('❌`Invalid: Skip amount exceeded amount of tracks in queue.`');
			message.channel.send(`:arrow_double_down:\`Skipped ${args ? `${args} track${args > 1 ? 's' : ''}` : ''}\``);
			return Instance.Skip(args);
		}

		message.channel.send('There\'s no active playback yet. Try `mplay` and add some sound!');
	},
};