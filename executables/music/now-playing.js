const { MessageEmbed: EmbedConstructor } = require('discord.js');
const { getColor } = require('colorthief');
const { createWriteStream } = require('fs');
const { dwebp } = require('webp-converter');
const request = require('request');

module.exports = {
	name: 'mnowplaying',
	aliases: ['mnp', 'np'],
	group: ['Music'],
	onTrigger: (message, client) => {

		const { author, durationMS, title, url, thumbnail, embedColor, requestedBy, queue: { currentStreamTime, repeatMode } } = client.MusicPlayer.nowPlaying(message);

		const progressBar =  client.MusicPlayer.createProgressBar(message,
					{
						timecodes: true,
						length: 29,
						indicator: `<${Math.floor(currentStreamTime / durationMS * 100)}%>`,
						line: '-',
					});
		const embed = new EmbedConstructor({
			title: "Now playing",
			description: `[${title}](${url})`,
			fields: [
				{
					name: "\u200b",
					value: `\`${progressBar}\`${repeatMode ? '🔂*`(playing on repeat)`*' : ''}`,
				},
				{
					name: 'Requested by',
					value: `<@${requestedBy.id}>`,
					inline: true,
				},
				{
					name: 'Uploder',
					value: `\`${author}\``,
					inline: true,
				},
			],
		}).setThumbnail(thumbnail);

		if (!thumbnail.length || embedColor)
		{
			embed.setColor(embedColor ? embedColor : 'random');
			return message.channel.send(embed);
		}
		request.head(thumbnail, () => {
			let fileExtension = thumbnail.match('i.ytimg.com') ? thumbnail.substr(0, thumbnail.indexOf('?') > 0 ? thumbnail.indexOf('?') : thumbnail.length).split('.').pop() : 'webp';
			const timestamp = Date.now();
			const finalize = (fail = false) => {
				getColor(`./temp-imgs/${timestamp}.${fileExtension}`, 150)
					.then(c => embed.setColor(c))
					.catch(() => fail = true);
				if (fail) embed.setColor('random');
				return message.channel.send(embed);
			};

			request(thumbnail).pipe(createWriteStream(`./temp-imgs/${timestamp}.${fileExtension}`))
			.on('close', () => {
				if (fileExtension.toLowerCase() === 'webp')
					return dwebp(`./temp-imgs/${timestamp}.${fileExtension}`, `./temp-imgs/${timestamp}.png`, "-o")
									.then(() => fileExtension = 'png')
									.catch(() => finalize(true));
				return finalize();
			});
		});
	},
};
