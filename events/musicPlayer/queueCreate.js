module.exports = {
	name: 'queueCreate',
	music: true,
	onEmit: (client, message, queue) => {
		console.log('queueCreate');
	},
};