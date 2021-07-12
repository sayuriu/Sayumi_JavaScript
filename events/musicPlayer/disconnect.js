module.exports = {
	name: 'disconnect',
	music: true,
	onEmit: (_, message, queue) => {
		message.channels.send(':anger: I was force disconnected from the channel.');
	},
};