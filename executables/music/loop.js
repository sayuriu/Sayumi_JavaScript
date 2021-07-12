module.exports = {
	name: 'loop',
	aliases: ['mlp'],
	group: ['Music'],
	usage: '[options?]',
	usageSyntax: '|[options? %s | -s for single / %q | -q for queue]|',

	onTrigger: (message, args, client) => {
		const queue = client.MusicPlayer.getQueue(message);
		if (queue)
		{
			const option = args[0]?.toLowerCase() ?? 'single';
			const validOptionsSingle = ['single', '%s', '-s'];
			const validOptionsQueue = ['queue', '%q', '-q'];
			if (validOptionsQueue.some(i => i === option))
			{
				const newState = inverse(queue.loopMode);
				const string = `${newState ? ':repeat:' : ':no_entry_sign:'}`;
				message.channel.send(string + ` Queue loop ${newState ? 'enabled' : 'disabled'}`);
				return client.MusicPlayer.setLoopMode(message, newState);
			}
			if (validOptionsSingle.some(i => i === option))
			{
				const newState = inverse(queue.repeatMode);
				const string = `${newState ? ':repeat_one: Track is now playing on repeat' : ':arrow_right: Playing forward with no repeat'}`;
				message.channel.send(string + ``);
				queue.tracks[0].firstTimeLoopDisplay = true;
				return client.MusicPlayer.setRepeatMode(message, newState);
			}
			return message.channel.send('Invalid option! `[-s | -q]`');
		}
		message.channel.send('Looping void...');
	},
};

const inverse = (any) => any ? false : true;