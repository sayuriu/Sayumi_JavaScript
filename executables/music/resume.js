module.exports = {
	name: 'resume',
	aliases: ['mres'],
	description: 'Resume the playback, if the player is paused.',
	group: ['Music'],
	onTrigger: (message, client) => {
		if (client.MusicPlayer.getQueue(message)?.paused)
		{
			// discordjs bug: dispatcher not resuming after calls
			client.MusicPlayer.resume(message);
			client.MusicPlayer.pause(message);
			return client.MusicPlayer.resume(message);
		}
		message.channel.send('The player is not paused!');
	},
};