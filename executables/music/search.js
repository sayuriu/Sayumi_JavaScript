const { Check, SearchVideos, MusicEmbeds, MusicInstance } = require('../../utils/Music');

module.exports = {
	name: 'msearch',
	aliases: ['ms, music-s, mlookfor'],
	group: ['Music'],
	stable: true,
	args: true,
	guildOnly: true,
	reqPerms: ['CONNECT', 'SPEAK'],
	onTrigger: async (message, args) => {

		if (!Check(message)) return;
		const listenerChannel = message.channel;

		let m;
		listenerChannel.send(new MusicEmbeds().Search('@status:waiting')).then(_ => m = _);

		console.time();
		const res = await SearchVideos(args.join(' '), 7);
		console.timeEnd();
		m.edit(new MusicEmbeds(res).Search(args.join(' ')));

		await listener(m, false, message.author.id, res, message);
	},
};

async function listener(message, resolved, UID, list, am)
{
	if (resolved)
	{
		message.delete();
		if (UID) return execute(am, UID, list);
	}
	const res = await message.channel.awaitMessages(m => m.author.id === UID, { max: 1, time: 60000, errors: ['time'] }).catch(err => { return listener(message, true, null); });

	// parse check
	if (res)
	{
		const rep = res.first().content;
		if (rep.trim().toLowerCase() === 'cancel') return listener(message, true, null);
		const int = parseInt(rep);

		if (!isNaN(int) && int > 0 && int < 8) return listener(message, true, int, list, am);
		return listener(message, false, UID, list, am);
	}
}

async function execute(message, index, res)
{
	if (!res) return;
	const song = Object.assign(res[index - 1], { requestedBy: message.member });
	const Instance = message.client.MusicInstances.get(message.guild.id);
	if (Instance) return Instance.AddToQueue(song);

	message.member.voice.channel.join().then(connection => {
		const inst = new MusicInstance({ voiceChannel: message.member.voice.channel, textChannel: message.channel }, connection);
		inst.AddToQueue(song);
	});
}