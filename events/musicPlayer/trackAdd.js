const { MessageEmbed: EmbedConstructor } = require('discord.js');
const request = require('request');
const { createWriteStream } = require('fs');
const { getColor } = require('colorthief');
const { dwebp } = require('webp-converter');

module.exports = {
	name: 'trackAdd',
	music: true,
	onEmit: (_, message, queue, track) => {

		const { author, duration, durationMS, requestedBy, thumbnail, title, url, embedColor } = track;

		const embed = new EmbedConstructor()
								.setTitle('Added to queue!')
								.setDescription(`[${title}](${url})`)
								.setThumbnail(thumbnail)
								.addFields([
									{
										name: 'Duration',
										value: durationMS ? `\`${duration}\`\n\`0x${(durationMS / 1000).toString(16).toLowerCase()}\`` : 'N/A',
										inline: true,
									},
									{
										name: 'Uploader',
										value: `\`${author}\``,
										inline: true,
									},
									{
										name: 'Requester',
										value: `<@${requestedBy.id}>`,
										inline: true,
									},
								])
								.setFooter(`Position in queue: ${queue.tracks.indexOf(track)}`);

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
				return message.channel.send(embed).then(m => queue.currentEmbed = m);
			};

			request(thumbnail).pipe(createWriteStream(`./temp-imgs/${timestamp}.${fileExtension}`))
			.on('close', () => {
				let failed = false;
				if (fileExtension.toLowerCase() === 'webp')
					dwebp(`./temp-imgs/${timestamp}.${fileExtension}`, `./temp-imgs/${timestamp}.png`, "-o")
									.then(() => fileExtension = 'png')
									.catch(() => failed = true);
				return finalize();
			});
		});
	},
};