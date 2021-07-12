module.exports = {
	name: 'playlistAdd',
	music: true,
	onEmit: (_, message, queue, playlist) => {
		console.log('add', playlist.tracks.length);
	},
};