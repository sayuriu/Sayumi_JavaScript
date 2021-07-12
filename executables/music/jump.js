module.exports = {
	name: 'skipto',
	aliases: ['jumpto'],
	description: 'Jumps to a specific track / position in the queue.',
	group: ['Music'],
	usage: '<trackName | number>',
	usageSyntax: [
		'|<number: Position to jump to in queue (Check the queue before calling)>|',
		'|<trackName: Skips to the nearest track that includes the query>|',
	],
	note: ['Recommend to use number since it\'s easier.'],
	onTrigger: (message, args, client) => {
		const { tracks, player } = client.MusicPlayer.getQueue(message);
		const mode = isNaN(parseInt(args.join(' '))) ? 'name' : 'num';
		switch(mode)
		{
			case 'name':
			{
				const index = tracks.findIndex(t => t.title.toLowerCase().includes(args.join(' ').toLowerCase().trim()));
				if (index < 1) return message.channel.send('No tracks with such names found.');
				player.jump(message, tracks[index]);
				return message.channel.send(`:fast_forward: Skipped ${index + 1 > 1 ? 'a track' : `${index + 1} tracks`}`);
			}
			case 'num':
			{
				const index = parseInt(args.join(' '));
				if (index >= tracks.length - 1) return message.channel.send(':no_entry_sign: Your index is out of queue!');
				player.jump(message, tracks[index]);
				return message.channel.send(`:fast_forward: Skipped ${index + 1 > 1 ? 'a track' : `${index + 1} tracks`}`);
			}
		}
	},
};