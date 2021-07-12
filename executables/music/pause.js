module.exports = {
	name: 'mpause',
	aliases: ['paus'],
	group: ['Music'],
	onTrigger: (message, client) => {
		if (client.MusicPlayer.getQueue(message)?.paused) return message.channel.send('The player is already paused!');
		client.MusicPlayer.pause(message);
	},
};