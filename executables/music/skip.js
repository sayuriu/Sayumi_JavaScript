module.exports = {
	name: 'mskip',
	aliases: ['msk'],
	description: 'Skips onto the next track... or whatever that is.',
	group: ['Music'],
	usage: '[tracks]',
	usageSyntax: '|[tracks (number): Skip this amount of tracks]|',
	onTrigger: (message, args, client) => {
		if (!args.length)
		{
			client.MusicPlayer.skip(message);
			return message.channel.send(':next_track: Skipped');
		}
		const { tracks } = client.MusicPlayer.getQueue(message);
		if (isNaN(args[0])) return message.channel.send(`I can skip buffer but, all I need is a number.\nCurrent number of tracks in queue: **${tracks.length - 1}**`);
		const index = parseInt(args.join(' '));
		if (index >= tracks.length - 1) return message.channel.send(':no_entry_sign: Your index is out of queue!');
		client.MusicPlayer.jump(message, tracks[index]);
		return message.channel.send(`:fast_foward: Skipped ${index > 1 ? 'a track' : `${index} tracks`}`);
	},
};