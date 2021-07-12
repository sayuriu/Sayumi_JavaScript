module.exports = {
	name: 'remove',
	description: 'Removes a track from the queue.',
	group: ['Music'],
	usage: '<amount or name>',
	usageSyntax: '|<amount: number (all)>|',
	notes: ['If you specify a name instead, this will remove the first match of query.'],
	onTrigger: (message, args, client) => {
		const { tracks } = client.MusicPlayer.getQueue(message);
		if (tracks.length - 1 < 1) return message.channel.send('There\'s nothing in the queue to remove!');
		if (isNaN(parseInt(args[0])))
		{
			if (args[0].toLowerCase().trim() === 'all')
			{
				client.MusicPlayer.clearQueue();
				return message.channel.send(':outbox_tray: Cleared the queue');
			}
			const index = tracks.findIndex(t => t.title.toLowerCase().includes(args.join(' ').toLowerCase().trim()));
			if (index < 1) return message.channel.send('No tracks with such names found.');

			const track = tracks[index];
			client.MusicPlayer.remove(track);
			return message.channel.send(`:white_check_mark: Removed \`${track.title}\``);
		}
		const index = parseInt(args[0]);
		if (index < 1 || index >= tracks.length) return message.channel.send('That position is out of queue!');
		const track = tracks[index];
		client.MusicPlayer.remove(track);
		return message.channel.send(`:white_check_mark: Removed \`${track.title}\``);
	},
};