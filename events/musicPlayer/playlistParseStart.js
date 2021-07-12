module.exports = {
	name: 'playlistParseStart',
	music: true,
	onEmit: (client, playlist, message) => {
		console.log('start', playlist);
	},
};