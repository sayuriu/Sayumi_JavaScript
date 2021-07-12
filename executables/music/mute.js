module.exports = {
	name: 'mute',
	aliases: ['mmute', 'setvol 0'],
	description: 'Mutes the player.',
	group: ['Music'],
	onTrigger: (message, client) => {
		const volume = client.MusicPlayer.getQueue(message).volume;
		if (volume === 0) message.channel.send('The player is currently muted!');
		client.MusicPlayer.setVolume(message, 0);
	},
};