module.exports = {
	name: 'searchCancel',
	music: true,
	onEmit: (client, message, query, track) => {
		return 'cancelled';
	},
};