const { MessageEmbed: EmbedConstructor } = require('discord.js');

module.exports = {
	name: 'queue-test',
	group: ['Music'],
	args: true,
	onTrigger: (message, args, client) => new Queue(message, args, client),
};

class Queue
{
	constructor(message, args, client)
	{
		this.pagePointer = !isNaN(args[0] - 1) ? args[0] - 1 : 0;
		this.message = message;
		this.cachedQueue = client.MusicPlayer.getQueue(message);
		this.cachedQueueString = this.GenerateQueueList(this.cachedQueue);
		this.buttons = this.GenerateButtons(this.ButtonData, this.cachedQueueString.length > 1 ? null : 'queue-cancel');
		this.Init();
	}

	Init()
	{
		const { message, cachedQueue, pagePointer } = this;
		const embed = this.GenerateEmbed(message, cachedQueue, pagePointer);
		this.ButtonListener(message.client, message, embed);
		setTimeout(() => this.destroy(), 60000);
	}

	ButtonListener(client, message, embed)
	{
		message.channel.send({
			embed,
			components: this.buttons,
		}).then(m => this.instance = m);

		client.on('clickButton', button => {
			if(this.destroyed) return;
			try {
				this.updateQueue();
				switch (button.id)
				{
					case 'queue-toFirst':
					{
						this.pagePointer = 0;
						break;
					}
					case 'queue-previousPage':
					{
						this.pagePointer--;
						break;
					}
					case 'queue-jumpTo':
					{
						// jumpto
						break;
					}
					case 'queue-nextPage':
					{
						this.pagePointer++;
						break;
					}
					case 'queue-lastPage':
					{
						this.pagePointer = this.cachedQueueString.length - 1;
						break;
					}
					default: break;
				}
			button.defer();
			this.updateEmbed();
			} catch (error) {
				console.log(error);
			}
		});
	}

	GenerateButtons({ global, data }, onlyMatch = null)
	{
		const { MessageButton, MessageActionRow } = require('discord-buttons');
		const interativePages = new MessageActionRow();
		if(onlyMatch) data = [data.find(d => d.ID === onlyMatch)];

		for (const buttonData of data)
		{
			const button = new MessageButton();
			if (Object.keys(global))
			{
				for (const attribute in global)
				{
					button[`set${attribute}`](global[attribute]);
				}
			}
			for (const attribute in buttonData)
			{
				button[`set${attribute}`](buttonData[attribute]);
			}
			interativePages.addComponent(button);
		}
		return interativePages;
	}

	GenerateEmbed(message, queue, pointer = 0)
	{
		const { tracks: t, repeatMode, playing: nowPlaying } = queue;

		const list = this.GenerateQueueList(t);
		if (pointer < 0) pointer = 0;
		if (pointer > list.length - 1) pointer = list.length - 1;
		this.pagePointer = pointer;

		const embed = new EmbedConstructor({
			title: '',
			description: [
				this.GetNowPlaying(nowPlaying),
				'',
				'**Up next...**',
				t.length - 1 ? list[pointer][1] : `> *Empty... Perhaps you can add more songs! Use...\`${message.prefixCall}play\`* to do so.`,
			].join('\n'),
		}).setThumbnail(nowPlaying.thumbnail);
		if (list.length > 1)
		{
			const pageText = (currentPage, highestIndex) =>
			{
				if (currentPage < 1) return '[first page]';
				if (currentPage === highestIndex - 1) return '[last page]';
				return `[page ${currentPage + 1} of ${highestIndex}]`;
			};
			embed.setFooter(`${list.length > 1 ? `Showing ${list[pointer][0]}` : ''} of ${t.length - 1} tracks in queue ${pageText(pointer, list.length)}`);
		}
		return embed;
	}

	GenerateQueueList(tracks)
	{
		const output = [];
		let startString = '';
		let indexRange;
		let pointer = 0;
		let startIndex = 1;

		// index 0 is now playing track
		for (let i = 1; i < tracks.length; i++)
		{

			const { author, duration, requestedBy: { id: userID }, title, url } = tracks[i];
			const additionalString = [
				`**${i}.**`,
				`> **Track:** *[${title}](${url})*`,
				`> **Author:** *${author}*`,
				`> **Duration:** *${duration}*`,
				`> **Requested:** *<@${userID}>*`,
				``,
			].join('\n');

			if (i > 1 && (i - 1) % 5 === 0)
			{
				if (!pointer)
				{
					const count = i - startIndex;
					indexRange = `the first${count > 1 ? ` ${count}` : ''}`;
				}
				else indexRange = `${startIndex} to ${i - 1}`;
				output[pointer] = [indexRange, startString];

				pointer++;
				startIndex = i;
				startString = '';
			}
			startString += additionalString;
		}
		indexRange = `the last ${tracks.length - startIndex}`;
		output[pointer] = [indexRange, startString];

		return output;
	}

	get ButtonData() {
		return {
			global: {
				Style: 'gray',
			},
			data: [
				{
					// Emoji: '⏮',
					Label: 'First',
					ID: 'queue-toFirst',
				},
				{
					// Emoji: '◀',
					Label: 'Prev',
					ID: 'queue-previousPage',
				},
					{
					// Emoji: '️#️⃣',
					Label: 'Jump to...',
					ID: 'queue-jumpTo',
				},
				{
					// Emoji: '▶',
					Label: 'Next',
					ID: 'queue-nextPage',
				},
				{
					// Emoji: '⏭',
					Label: 'Last',
					ID: 'queue-lastPage',
				},
			],
		};
	}

	GetNowPlaying({ author, duration, requestedBy : { id: userID }, title, url })
	{
		return [
			`▶ **Now playing!**`,
			`> **Track:** *[${title}](${url})*`,
			`> **Author:** *${author}*`,
			`> **Duration:** *${duration}*`,
			`> **Requested:** *<@${userID}>*`,
			``,
		].join('\n');
	}

	updateQueue()
	{
		this.cachedQueue = this.message.client.MusicPlayer.getQueue(this.message);
		this.cachedQueueString = this.GenerateQueueList(this.cachedQueue.tracks);
		this.buttons = this.GenerateButtons(this.ButtonData, this.cachedQueueString.length > 1 ? null : 'queue-cancel');
	}

	updateEmbed()
	{
		const { message, cachedQueue, pagePointer } = this;
		const embed = this.GenerateEmbed(message, cachedQueue, pagePointer);

		if (!this.instance.deleted) this.instance.edit({
			embed,
			components: this.buttons,
		});
	}

	destroy()
	{
		this.destroyed = true;
		if (!this.instance.deleted) this.instance.delete();
	}
}