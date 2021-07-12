module.exports = {
	name: 'repeat',
	aliases: ['mlp -s'],
	description: 'Toggles single loop.',
	group: ['Music'],
	onTrigger: (message, client) => {
		const queue = client.MusicPlayer.GetQueue(message);
		const newState = inverse(queue.loopMode);
		const string = `${newState ? ':repeat:' : ':no_entry_sign:'}`;
		message.channel.send(string + ` Queue loop ${newState ? 'enabled' : 'disabled'}`);
		return client.MusicPlayer.setRepeatMode(message, newState);
	},
};

const inverse = (any) => any ? false : true;