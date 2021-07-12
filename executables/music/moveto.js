module.exports = {
	name: 'moveto',
	description: 'Move to the designated voice channel.',
	group: ['Music'],
	onTrigger: (message, args, client) => {
		const targetChannel = message.guild.fetch().channels.cache.find(ch => ch.id === args.join(' ') || ch.name === args.join(' '));
		if (!targetChannel) return message.channel.send('No such channel found!');
		if (targetChannel.type !== 'voice') return message.channel.send('Target channel is not a voice channel.');
		if (!targetChannel.permissionsFor(client).has('CONNECT')) return message.channel.send('Can\'t connect to the channel: Lacking permission to connect');
		if (!targetChannel.permissionsFor(client).has('SPEAK')) return message.channel.send('Can\'t connect to the channel: Lacking permission to speak / play audio');
		client.MusicPlayer.moveTo(message, targetChannel);
	},
};