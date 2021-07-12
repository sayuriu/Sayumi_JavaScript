module.exports = {
	name: 'previous',
	aliases: ['prev'],
	description: 'Plays the previous track.',
	group: ['Music'],
	onTrigger: (message, client) => {
		client.MusicPlayer.back(message);
		return message.channel.send(':previous_track: Now playing previous track!');
	},
};