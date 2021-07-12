const { music: { volume_set } } = require('../../utils/json/Responses.json');

module.exports = {
	name: 'volume',
	aliases: ['mvol', 'setvol'],
	description: 'Sets the playback volume.',
	group: ['Music'],
	usage: '[percentage?]',
	usageSyntax: '|[percentage: volume (0 - 200)]|',
	notes: 'Empty argument will show the current playback volume.',
	onTrigger: (message, args, client) => {
		const { Randomize } = client.Methods.Common;
		if (!args.length || isNaN(parseInt(args[0])))
		{
			const { volume } = client.MusicPlayer.getQueue(message);
			return message.channel.send(volume > 0 ? `Current playback volume is \`${volume}%\`` : 'The player is currently muted!');
		}
		if (args[0] > 200) args[0] = 200;
		if (args[0] < 0) args[0] = 0;
		if (args[0] === 0) message.channel.send('The player is currently muted!');
		client.MusicPlayer.setVolume(message, parseInt(args[0]));
		if (Object.keys(volume_set).some(i => i === (args[0] / 100).toString())) return message.channel.send(Randomize(volume_set[`${args[0] / 100}`]));
		return message.channel.send(Randomize(volume_set.custom).replace('${value}', `${args[0]}`));
	},
};