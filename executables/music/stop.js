module.exports = {
	name: 'stop',
	aliases: ['dc'],
	description: 'Stop the playback and disconnects from the voice channel.',
	group: ['Music'],
	onTrigger: (message, client) => client.MusicPlayer.stop(message),
};