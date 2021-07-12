const { MessageEmbed: EmbedConstructor } = require('discord.js');
const { createWriteStream } = require('fs');
const { getColor } = require('colorthief');
const request = require('request');
const { dwebp } = require('webp-converter');

module.exports = {
	name: 'queue',
	aliases: ['mque'],
	group: ['Music'],
	onTrigger: (message, args, client) => {
		const queue = client.MusicPlayer.getQueue(message);
		if (!queue) return message.channel.send('There\'s nothing being played yet!');

		const { duration, durationMS, requestedBy, thumbnail, title, url, embedColor } = queue.playing;
		const { tracks: tracksInQueue, repeatMode } = queue;
		const elapsedPercentage = (queue.currentStreamTime / durationMS * 100).toFixed(1);
		const pageText = (p, highestIndex) => {
			if (p < 1) return '[first page]';
			if (p === highestIndex - 1) return '[last page]';
			return `[page ${pagePointer + 1}]`;
		};

		let pagePointer = !isNaN(args[0] - 1) ? args[0] - 1 : 0;

		const list = QueueString(tracksInQueue);
		const embed = new EmbedConstructor({
			title: `${message.guild.name}'s queue`,
			fields: [
				{
					name: ':arrow_forward: Now playing!',
					value: `*Requested by <@!${requestedBy.id}>*` +
							`\n[${title}](${url})` +
							`\n\`${duration} < ${elapsedPercentage}% elapsed${repeatMode ? ' [playing on repeat]' : ''}\``,
				},
				{
					name: ':arrow_down: Up next...',
					value: tracksInQueue.length - 1 ? list[pagePointer][1] : '*Empty, like my soul... Oh wait, I don\'t have a soul... Aha..*',
				},
			],
		}).setThumbnail(thumbnail);
		if (list.length > 1) embed.setDescription(`*You can switch pages by reacting to those buttons below.*`)
												.setFooter(`${list.length > 1 ? `Showing ${list[pagePointer][0]}` : ''} of ${tracksInQueue.length - 1} tracks ${pageText(pagePointer, list.length)}`);

		embed.cachedRepeatMode = repeatMode;
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
				if (list.length < 2) return message.channel.send(embed);
				message.channel.send(embed).then(m => handle(m, tracksInQueue));
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

		const handle = async (m, tracks) => {
			const options = ['⏮', '◀', '▶', '⏭', '❌'];
			m.react('⏮');
			m.react('◀');
			if (list.length > 2)
			{
				options.push('#️⃣');
				m.react('#️⃣');
			}
			m.react('▶');
			m.react('⏭');
			m.react('❌');

			const filter = (reaction, reactUser) => options.includes(reaction.emoji.name) && reactUser.id === message.author.id;
			const timeLimit = 60000;

			let timedout;
			let userTimeout = client.Timestamps.get(message.author.id);
			if (!userTimeout)
			{
				userTimeout = client.Timestamps.get(message.author.id);
				client.Timestamps.set(message.author.id, Date.now() + timeLimit);
				setTimeout(() => client.Timestamps.delete(message.author.id), timeLimit);
			}

			const notifyInactive = (msg, em) => {
				msg.reactions.removeAll().catch(() => {
					const footerText = em.footer.text;
					em.setFooter(footerText + '\nTHIS MESSAGE IS INACTIVE!');
					return msg.edit(em);
				});
			};

			const listener = async (msg, time) => {
				if (timedout || msg.deleted) return;

				await msg.awaitReactions(filter, { max: 1, time: time, errors: ['time'] })
				.then(async received => {
					const reaction = await received.first();
					msg.reactions.cache.get(reaction.emoji.name).users.remove(message.author.id);
					switch (reaction.emoji.name)
					{
						case '❌':
						{
							timedout = true;
							notifyInactive(m, embed);
							break;
						}
						case '⏮':
						{
							pagePointer = 0;
							break;
						}
						case '◀':
						{
							if (pagePointer > 0) pagePointer--;
							break;
						}
						case '#️⃣':
						{
							listenerText(msg);
							break;
						}
						case '▶':
						{
							if (pagePointer < list.length - 1) pagePointer++;
							break;
						}
						case '⏭':
						{
							pagePointer = list.length - 1;
							break;
						}
					}
					if (!timedout)
					{
						const { repeatMode: RMState } = client.MusicPlayer.getQueue(message);
						if (embed.cachedRepeatMode !== RMState)
						{
							embed.fields[0].value = `*Requested by <@!${requestedBy.id}>*` +
																`\n[${title}](${url})` +
																`\n\`${duration} < ${elapsedPercentage}% elapsed${RMState ? ' [playing on repeat]' : ''}\``;
							embed.cachedRepeatMode = RMState;
						}
						embed.fields[1].value = list[pagePointer][1];
						embed.setFooter(`${list.length > 1 ? `Showing ${list[pagePointer][0]}` : ''} of ${tracksInQueue.length - 1} tracks ${pageText(pagePointer, list.length)}`);
						msg.edit(embed);
					}
					const timeLeft = Date.now() - userTimeout;
					if (timeLeft > 0 && !timedout) return listener(msg, timeLeft, tracks);
					listener(msg, timeLimit);
				})
				.catch(() => {
					timedout = true;
					notifyInactive(m, embed);
				});
			};

			const listenerText = async (msg) => {
				let temp;
				const timeLeft = Date.now() - userTimeout;
				if (timedout || msg.deleted) return;
				msg.channel.send(`Which page do you want to go to?[1 - ${list.length}]`).then(_ => temp = _);
				const response = await msg.channel.awaitMessages(M => M.author.id === message.author.id && !isNaN(parseInt(M.content)), { max: 1, time: timeLeft, errors: ['time'] })
													.catch(e => timedout = true);
				const received = response.first();
				const index = parseInt(received.content);
				if (received.deletable) received.delete();
				temp.delete();

				if (index < 1 || index > list.length) return msg.channel.send('That\'s page is non-existant!').then(_ => _.delete({ timeout: 3000 }));
				pagePointer = index - 1;

				embed.fields[1].value = list[pagePointer][1];
				embed.setFooter(`${list.length > 1 ? `Showing ${list[pagePointer][0]}` : ''} of ${tracksInQueue.length - 1} tracks ${pageText(pagePointer, list.length)}`);
				return msg.edit(embed);
			};

			listener(m, timeLimit, tracks);
		};
	},
};

function QueueString(tracks)
{
	const out = [];
	let initString = '';
	let indexRange;
	let pointer = 0;
	let startIndex = 1;

	// index 0 is now playing track
	for (let i = 1; i < tracks.length; i++)
	{
		const { duration, requestedBy, title, url } = tracks[i];
		const additionalString = `\`${i}.\` <@!${requestedBy.id}> \`| ${duration}\`\n\`>\` [${title}](${url})\n`;

		if ((initString + additionalString).length > 1024)
		{
			if (pointer < 1)
			{
				const count = i - startIndex;
				indexRange = `the first${count > 1 ? ` ${count}` : ''}`;
			}
			else indexRange = `${startIndex} to ${i  - 1}`;
			out[pointer] = [indexRange, initString];
			pointer++;
			startIndex = i;
			initString = '';
		}
		initString += additionalString;
	}
	indexRange = `the last ${tracks.length - startIndex}`;
	out[pointer] = [indexRange, initString];
	return out;
}