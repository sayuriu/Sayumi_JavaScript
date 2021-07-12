module.exports = {
	name: 'playlistParseEnd',
	music: true,
	onEmit: (client, playlist, message) => {
		console.log('end', '\n', playlist.id, '\n', playlist.title, '\n', playlist.tracks.length);
	},
};