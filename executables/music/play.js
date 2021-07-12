const ytpl = require('ytpl');

module.exports = {
	name: 'mplay',
	group: ['Music'],
	reqPerms: ['CONNECT', 'SPEAK'],
	onTrigger: async (message, args, client) => {
		if (!args.length)
		{
			if (client.MusicPlayer.getQueue(message)?.paused) return client.MusicPlayer.resume(message);
			return message.channel.send();
		}
		const failCallback = () => {
			return message.channel.send('There was a problem while fetching playlist.');
		};
		const [query, ind] = await handleYTLinks(args.join(' '), failCallback);
		client.MusicPlayer.play(message, query, true, ind);
	},
};

async function handleYTLinks(link, failCallback)
{
	const [, videoID] = link.match(videoRegEx) ?? [];
	const [, playlistID] = link.match(playlistRegEx) ?? [];
	const [, startIndex] = link.match(playlistIndexRegEx) ?? [];

	if (playlistID)
	{
		if (startIndex) return [generatePlaylistLink(playlistID), new Number(startIndex)];
		if (videoID)
		{
			try
			{
				const res = await ytpl(playlistID);
				const target = res.items.filter(v => v.id === videoID && v.isPlayable)[0];

				return [generatePlaylistLink(playlistID), target ? res.items.indexOf(target) : 0];
			}
			catch(e)
			{
				failCallback();
				if (videoID) return [videoID, 0];
				return [link, 0];
			}
		}
	}
	if (videoID) return [videoID, 0];
	return [link, 0];
}

const generatePlaylistLink = id => `https://www.youtube.com/playlist?list=${id}`;

const playlistRegEx = /(?:youtube\.com.*(?:\?|&)(?:list)=)((?!videoseries)[a-zA-Z0-9_-]*)/;
const playlistIndexRegEx = /&index=(\d+)/;
const videoRegEx = /(?:youtube\.com.*(?:\?|&)(?:v)=|youtube\.com.*embed\/|youtube\.com.*v\/|youtu\.be\/)((?!videoseries)[a-zA-Z0-9_]*)/;
