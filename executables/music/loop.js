const { Check } = require('../../utils/Music');

module.exports = {
	name: 'loop',
	aliases: ['mlp'],
	group: ['Music'],
	args: true,
	stable: true,
	guildOnly: true,
	usage: '[options?]',
	usageSyntax: '|[options? %s | -s for single / %q | -q for queue]|',

	onTrigger: (message, args, client) => {
		if (!Check(message)) return;
		const Instance = client.MusicInstances.get(message.guild.id);
		if (Instance)
		{
			const option = args[0]?.toLowerCase() ?? 'single';
			const validOptionsSingle = ['single', '%s', '-s'];
			const validOptionsQueue = ['queue', '%q', '-q'];
			if (validOptionsQueue.some(i => i === option)) return Instance.Toggle('queue-loop');
			if (validOptionsSingle.some(i => i === option)) return Instance.Toggle('single-loop');
			return message.channel.send('Invalid option! `[-s | -q]`');
		}
		message.channel.send('Looping void...');
	},
};