const { MessageEmbed: EmbedConstructor } = require('discord.js');

module.exports = {
	name: 'searchResults',
	music: true,
	onEmit: (client, message, query, tracks, collector) => {
		console.log('query', query, '\ntracks', tracks);

		const tracksList = [];
		let maxLength = 0;
		for (let i = 0; i < tracks.length; i++)
		{
			if (tracks[i].duration.length > maxLength) maxLength = tracks[i].duration.length;
		}
		for (let i = 0; i < tracks.length; i++)
		{
			const { author, duration, title, url  } = tracks[i];
			tracksList.push(`\`${(i + 1).toString().padStart(2, ' ')} | ${duration.padStart(maxLength, ' ')}\` [${title}](${url})`);
		}
		const embed = new EmbedConstructor({
			title: `Search results of \`${query}\``,
			description: '*`No.| dur. | name`*\n' + tracksList.join('\n'),
			footer: {
				text: 'Type a number / cancel or react to the options below.',
			},
		});

		// Reaction system? Cancel or idk
		if (message.searchEmbed && !message.searchEmbed.deleted) message.searchEmbed.edit(embed).then(() => delete message.searchEmbed);
		else message.channel.send(embed);
	},
};
