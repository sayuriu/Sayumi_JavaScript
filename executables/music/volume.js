const { Check } = require('../../utils/Music');

module.exports = {
	name: 'volume',
	aliases: ['mvol', 'setvol'],
	group: ['Music'],
	args: true,
	reqArgs: true,
	stable: true,
	guildOnly: true,
	onTrigger: (message, args, client) => {
		if (!Check(message)) return;
		const Instance = client.MusicInstances.get(message.guild.id);
		if (Instance)
		{
			const input = args[0].toLowerCase();
			switch(input)
			{
				case'double': return Instance.SetVolume(2);
				case 'one': return Instance.SetVolume(1);
				case 'half': return Instance.SetVolume(0.5);
				case 'quarter': return Instance.SetVolume(0.25);
				default: return Instance.SetVolume(input);
			}
		}

		message.channel.send('What am I supposed to disconnect from?');
	},
};