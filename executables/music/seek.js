const { Util: { parseMS } } = require('discord-player');

module.exports = {
	name: 'seek',
	aliases: ['mseek'],
	description: 'Seeks to a certain timestamp in playback. Note that this will also resume the playback if it\'s paused.',
	group: ['Music'],
	cooldown: 5,
	onTrigger: (message, args, client) => {
		if (args[0].toLowerCase() === 'start' || args[0].toLowerCase() === 'begin') args = ['0'];
		if (args[0].toLowerCase() === 'end') args = ['0x7fffffff'];
		let position = client.Methods.Time.ParseTimeCode(args.join(' ').trim()) * 1000;
		console.log(position);
		if (position === 'invalid') return message.channel.send('Invalid time code!\nValid examples: `120` `4:20` `1:02:13` *`(don\'t have to include the 0)`*');
		if (position === 'out-of-scope') return message.channel.send('Your input is out of scope! Time code option is only allowed up to day `d:h:m:s`.');

		const queue = client.MusicPlayer.getQueue(message);
		const { durationMS } = queue.playing;
		if (position < 0) position = durationMS  - position;
		if (position < 0) position = 0;

		// if position > song duration
		if (position >= durationMS)
		{
			if (!queue.repeatMode) return message.channel.send('You just asked to seek till the end of the song, __this will skip the current track__, are you sure?').then(m => {
				m.react('✔');
				m.react('❌');
				const filter = (reaction, reactUser) => ['✔', '❌'].includes(reaction.emoji.name) && reactUser.id === message.author.id;
				return m.awaitReactions(filter, { max: 1, time: durationMS - queue.currentStreamTime, errors: ['time'] }).then(received => {
					switch (received.first().emoji.name)
					{
						case '✔':
						{
							if (client.MusicPlayer.skip(message)) return message.channel.send(':next_track: Skipped');
							return message.channel.send('For some reasons, I couldn\'t skip. Please try again.');
						}
						case '❌': return m.delete();
					}
				});
			});
			position = durationMS;
		}

		let line;
		const timestamp = buildTimeCode(parseMS(position));
		if (position > queue.currentStreamTime) line = `:fast_forward: Fast forward to \`${timestamp}\``;
		if (position < queue.currentStreamTime) line = `:rewind: Rewinded to \`${timestamp}\``;
		if (!position) line = ':rewind: Rewinded to the beginning of the track!';
		if (position === durationMS) line = ':fast_forward: Jumped to the end of the track!';

		console.log('action:pause');
		if (!queue.paused) client.MusicPlayer.pause(message);
		client.MusicPlayer.seek(message, position)
			.then(() => {
				console.log('action:resume');
				client.MusicPlayer.resume(message);
				message.channel.send(line);
			})
			.catch(e => console.log(e));
	},
};

function buildTimeCode(data) {
	const required = ['days', 'hours', 'minutes', 'seconds'];
	const parsed = Object.keys(data).filter(x => required.includes(x)).map(m => (data[m] > 0 ? data[m] : 0));
	let ind, confirm, string = '';
	parsed.forEach(n => {
		if (n)
		{
			if (confirm) return;
			string += n.toString();
			ind = parsed.indexOf(n);
			confirm = true;
		}
	});
	string = [string].concat(parsed.slice(ind + 1, parsed.length).map((x) => x.toString().padStart(2, '0'))).join(':');
	return string.length <= 3 ? `0:${string.padStart(2, '0') || 0}` : string;
}