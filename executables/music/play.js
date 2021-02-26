const { SearchVideos, Check, MusicInstance } = require('../../utils/Music');

module.exports = {
	name: 'mplay',
	group: ['Music'],
	stable: true,
	args: true,
	reqArgs: true,
	guildOnly: true,
	reqPerms: ['CONNECT', 'SPEAK'],
	onTrigger: async (message, args, client) => {
		if (!Check(message)) return;
		const Instance = client.MusicInstances.get(message.guild.id);
		if (!args)
		{
			if (Instance.vcConnection.dispatcher.paused) return Instance.TogglePause('resume');
			return message.member.voice.channel.join().then(connection =>
				new MusicInstance({ voiceChannel: message.member.voice.channel, textChannel: message.channel }, connection),
			);
		}
		let [v] = await SearchVideos(args.join(' '), 1);
		v = Object.assign(v, { requestedBy: message.member });

		if (Instance) return Instance.AddToQueue(v);

		message.member.voice.channel.join().then(connection => {
			const inst = new MusicInstance({ voiceChannel: message.member.voice.channel, textChannel: message.channel }, connection);
			inst.AddToQueue(v);
		});
	},
};