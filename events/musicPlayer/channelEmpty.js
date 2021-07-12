module.exports = {
	name: 'channelEmpty',
	music: true,
	onEmit: (client, message) => {
		message.channel.send('e');
	},
};
