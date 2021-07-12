const { MessageEmbed: EmbedConstructor } = require('discord.js');
const request = require('request');
const { createWriteStream } = require('fs');
const { getColor } = require('colorthief');
const { dwebp } = require('webp-converter');

module.exports = {
	name: 'trackStart',
	music: true,
	onEmit: (_, message, track, queue) => {

		console.log("...done");
		console.log('trackStart');
		if (queue.repeatMode && !track.firstTimeLoopDisplay) return;
		if (track.firstTimeLoopDisplay) delete track.firstTimeLoopDisplay;
		// toggle
		if (queue.currentEmbed && !queue.currentEmbed.deleted) queue.currentEmbed.delete();

		const { author, duration, durationMS, requestedBy, thumbnail, title, url, raw: { source }, embedColor } = track;
		console.log(`${title} "${url}"`);
		const { tracks, repeatMode } = queue;

		const nextString = `${repeatMode ? 'Now playing in loop!' : `${tracks[1] ? `Next up: ${tracks[1].title}` : 'This is the last song in the queue!'}`}`;
		const embed = new EmbedConstructor()
								.setThumbnail(thumbnail)
								.setTitle('Now playing!')
								.setDescription(`[${title}](${url})`)
								.addFields([
									{
										name: 'Duration',
										value: durationMS ? `\`${duration}\`\n\`0x${(durationMS / 1000).toString(16).toLowerCase()}\`` : 'N/A',
										inline: true,
									},
									{
										name: source === 'arbitrary' ? 'Source' : 'Uploader',
										// value: source === 'soundcloud' ? `\`${author.name ?? author.username}\`\n[(Permalink)](${author.url})` : `\`${author}\``,
										value: `\`${author}\``,
										inline: true,
									},
									{
										name: 'Requester',
										value: `<@${requestedBy.id}>`,
										inline: true,
									},
								])
								.setFooter(nextString);

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
				return finalize(failed);
			});
		});
	},
};
