const { MessageEmbed: EmbedConstructor } = require('discord.js');
const ytAPI = require('simple-youtube-api');
const ytdl = require('ytdl-core');
const { error: outerr } = require('./Logger');
const ytInstance = new ytAPI(require('../MainModules').APIs.youtube);
const convertTime = require('./functions/time-manupilation/timestamp-to-time');
const randomize = require('./functions/common/randomize');
const HSLtoRGB = require('./functions/common/hsl-to-rgb');
const { music: { embed, volume_set } } = require('./json/Responses.json');

class MusicInstance
{
	constructor(data, vcConnection)
	{
		this.voiceChannel = data.voiceChannel;
		this.textChannel = data.textChannel;
		this.queue = [];
		this.vcConnection = vcConnection;
		this.cachedVolume = 0;
		this.dispatcher = null;
		this.nowPlaying = null;
		this.activeTimeout = null;
		this.queueLoop = false;
		this.singleLoop = false;
		this.shuffleState = false;

		this.LeaveTimeout = d => this.activeTimeout = setTimeout(() => this.destroy(), d);
		this.alert = m => this.textChannel.send(m);

		this.Init();
	}

	Init()
	{
		this.textChannel.send(`Joined <#${this.voiceChannel.id}> and related commands bound to <#${this.textChannel.id}>`);
		this.textChannel.client.MusicInstances.set(this.textChannel.guild.id, this);
		this.LeaveTimeout(45000);
	}

	Play(song)
	{
		if (song !== this.nowPlaying) this.nowPlaying = song;
		this.textChannel.send(this.GetNowPlaying());
		this.HandleDispatcher(this.vcConnection.play(ytdl(song.video_url)));
	}
	TogglePause(args)
	{
		switch(args)
		{
			case 'pause':
			{
				if (this.vcConnection.dispatcher.paused) return this.alert('❌`The playback is already paused!`');
				this.vcConnection.dispatcher.pause();
				this.LeaveTimeout(45000);
				return this.alert(':pause_button:`Paused!`');
			}
			case 'resume':
			{
				if (!this.vcConnection.dispatcher.paused) return this.alert('❌`The playback is not paused!`');
				this.vcConnection.dispatcher.resume();
				this.CancelLeaveTimeout();
				return this.alert(':arrow_forward:`Resumed!`');
			}
		}
	}
	Skip(amount = 0)
	{
		if (amount)
		{
			const index = amount;
			if (!this.queue[index]) return false;

			if (this.queueLoop)
			{
				const sorted = [];
				for (let i = 0; i < this.queue.length; i++)
				{
					if (i === index) return;
					sorted.push(this.queue[i]);
				}
				this.Play(this.queue[index]);
				this.queue = sorted;
			}
			else
			{
				this.Play(this.queue[index]);
				this.queue.splice(index + 1, this.queue.length);
			}
			return true;
		}

		if (this.queueLoop && this.nowPlaying) this.queue.push(this.nowPlaying);
		this.Play(this.queue[0]);
		this.queue.shift();
	}
	AddToQueue(track)
	{
		this.queue.push(track);
		this.CancelLeaveTimeout();
		if (!this.nowPlaying) this.Skip();
	}
	GetQueue()
	{
		return new MusicEmbeds(this).Queue();
	}
	GetNowPlaying(opt)
	{
		return new MusicEmbeds(this).NowPlaying(opt);
	}
	Toggle(options)
	{
		switch(options.toLowerCase())
		{
			case 'single-loop':
			{
				this.singleLoop = toggle(this.singleLoop);
				return this.alert();
			}
			case 'queue-loop':
			{
				this.queueLoop = toggle(this.queueLoop);
				return this.alert();
			}
			case 'shuffle':
			{
				this.shuffleState = toggle(this.shuffleState);
				return this.alert();
			}
		}
	}
	SetVolume(value)
	{
		value = value.match(/^\d+%$/g) ? parseInt(value) / 100 : parseFloat(value);
		if (isNaN(value)) return 'invalid';
		if (value >= 0 && value <= 2)
		{
			if (!this.vcConnection.dispatcher.editable) return this.alert('Can\'t change the playback volume.');
			this.vcConnection.dispatcher.setVolume(value);
			let outString;

			switch (value)
			{
				case 0: return this.alert('You can\'t mute playback!');
				case 0.5:
				{
					outString += randomize(volume_set.half);
					break;
				}
				case 1:
				{
					outString += randomize(volume_set.one);
					break;
				}
				case 2:
				{
					outString += randomize(volume_set.double);
					break;
				}
				default:
				{
					outString += randomize(volume_set.custom)
									.replace(/\${value}/g, value)
									.replace(/\${valuePercent}/, `${value * 100}%`);
				}
			}
			return this.alert(outString);
		}
		return this.alert('Your value is out of range! `[> 0 - 200%]`');
	}

	HandleDispatcher(connection)
	{
		this.dispatcher = connection;
		connection.on('finish', () => {
			connection.end();
			if (this.singleLoop) return this.Play(this.nowPlaying);

			this.nowPlaying = null;
			if (!this.queue.length) return this.LeaveTimeout(45000);
			this.Skip();
		});
		connection.on('error', e => {
			// this.destroy();
			// connection.destroy(e);
			this.textChannel.send('An error has occurred.');
			if (!this.queue.length) return this.destroy();
			this.Skip();
			outerr(e);
		});
	}
	CancelLeaveTimeout()
	{
		// if (this.activeTimeout instanceof NodeJS.Timeout) clearTimeout(this.activeTimeout);
		clearTimeout(this.activeTimeout);
		this.activeTimeout = null;
	}

	destroy()
	{
		this.voiceChannel.leave();
		return this.textChannel.client.MusicInstances.delete(this.textChannel.guild.id);
	}
}

class MusicEmbeds
{
	constructor(data)
	{
		this.data = data;
	}
	Search(input)
	{
		if (input === '@status:waiting')
		{
			return new EmbedConstructor()
								.setTitle(randomize(embed.searching))
								.setDescription(`Query: \`${input}\``);
		}

		const searchRes = randomize(embed.resolved).replace(/\${input}/, input);
		const videos = this.data;
		if (!videos.length) return false;

		const arr = [];
		for (let i = 0; i < videos.length; i++)
		{
			const { title, videoId, channelId, channelName, lengthSeconds, age_restricted, isPrivate } =  videos[i];
			const url = `http://www.youtube.com/watch?v=${videoId}`;
			const channelURL = `http://www.youtube.com/channel/${channelId}`;

			const { hour, minute, second } = convertTime(lengthSeconds * 1000);

			arr.push(`\`${i + 1}.\` __[${title}](${url})__ by [${channelName}](${channelURL}) \`${TimeString(hour, minute, second)}\` ${isPrivate ? '`P`' : ''} ${age_restricted ? '`R`' : ''}`);
		}
		// arr.push('Or... `cancel`?');

		return new EmbedConstructor()
					.setColor('#30b0f0')
					.setTitle(searchRes)
					.setDescription('*Type a number below or `cancel` to cancel.*\n\n' +  arr.join('\n'));
	}
	Queue()
	{
		const { queue, queueLoop, singleLoop, shuffleState } = this.data;
		const arr = [];
		let outString = '';
		let allDuration = 0;
		if (queue.length)
		{
			for (let i = 0; i < queue.length; i++)
			{
				let string = '';
				const { title, lengthSeconds, video_url, requestedBy } = queue[i];
				allDuration += lengthSeconds;

				const { hour, minute, second } = convertTime(lengthSeconds * 1000);
				string += `\`${i}. Requested by\` <@!${requestedBy.id}> | \`${requestedBy.user.tag}\`\n\`[${TimeString(hour, minute, second)}]\`[${title}](${video_url})\n`;

				if (outString.length + string.length > 1024)
				{
					arr.push(outString);
					outString = '';
				}
				outString += string;
			}
		}
		else outString += 'It\'s an empty void...';
		arr.push(outString);

		// now playing
		const { title, lengthSeconds, video_url, requestedBy } = this.data.nowPlaying;
		const { hour: npH, minute: npM, second: npS } = convertTime(lengthSeconds * 1000);
		const npDuration = TimeString(npH, npM, npS);

		// elapsed
			// const { hour, minute, second } = convertTime(this.data.dispatcher.streamTime);
		const part = (this.data.dispatcher.streamTime / (lengthSeconds * 1000));

		// all duration
		const { hour: allH, minute: allM, second: allS } = convertTime(allDuration * 1000);
		allDuration = TimeString(allH, allM, allS);

		const bool = (boole) => boole ? ':white_check_mark:' : '❌';

		const out = [];
		arr.forEach(a => {
			out.push(
				new EmbedConstructor()
					.setTitle('Queue')
					.setDescription(
						`${queue.length ? `*\`Total ${queue.length} track${queue.length > 1 ? 's' : ''} in queue, total of ${TimeStringText(allDuration)}\`*\n` : ''}` +
						`\`Single loop: ${bool(singleLoop)} | Queue loop: ${bool(queueLoop)} | 🔀 Shuffering ${shuffleState ? 'enabled' : 'disabled'}\``,
					)
					.setColor(HSLtoRGB(Math.round(part * 360), 74, 49))
					.addFields([
						{
							name: ':arrow_forward: Now playing',
							value: `[${title}](${video_url})\n\`${npDuration} [${(part * 100).toFixed(1) + '%'}]| Resquested by: ${requestedBy.displayName} [${requestedBy.user.tag}]\``,
						},
						{
							name: ':arrow_down_small: Up next...',
							value: a,
						},
					]),
			);
		});

		return out;
	}
	NowPlaying(opt = 1)
	{
		const { video_url, title, author: { name: channelName, channel_url: channelUrl }, lengthSeconds, thumbnails, requestedBy } = this.data.nowPlaying;
		const { hour: npH, minute: npM, second: npS } = convertTime(lengthSeconds * 1000);
		const npDuration = TimeString(npH, npM, npS);

		switch (opt)
		{
			case 0:
			{
				const part = (this.data.dispatcher.streamTime / (lengthSeconds * 1000));
				const { hour: eH, minute: eM, second: eS } = convertTime(this.data.dispatcher.streamTime);
				const elapsedDuration = TimeString(eH, eM, eS);

				return new EmbedConstructor()
							.setTitle('Now playing ' + this.data.vcConnection.dispatcher.paused ? ':pause_button:' : ':arrow_forward:')
							.setColor('random')
							.setDescription(`[${title}](${video_url})`)
							.setThumbnail(thumbnails[thumbnails.length - 1].url)
							.addFields([
								{
									name: 'Channel',
									value: `**\`${channelName}\`**\n[(Channel link)](${channelUrl})`,
									inline: true,
								},
								{
									name: 'Elapsed',
									value: `\`${elapsedDuration} / ${npDuration} \`**\`${(part * 100).toFixed(1) + '%'}\`**`,
									inline: true,
								},
								{
									name: 'Requested by',
									value: `\`${requestedBy.displayName}  [${requestedBy.user.tag}]\``,
									inline: true,
								},
							]);
			}
			case 1: return new EmbedConstructor()
						.setTitle('Now Playing!')
						.setColor('random')
						.setDescription(`[${title}](${video_url})`)
						.setThumbnail(thumbnails[thumbnails.length - 1].url)
						.addFields([
							{
								name: 'Channel',
								value: `**\`${channelName}\`**\n[(Channel link)](${channelUrl})`,
								inline: true,
							},
							{
								name: 'Duration',
								value: `**\`${npDuration}\`**`,
								inline: true,
							},
							{
								name: 'Requested by',
								value: `\`${requestedBy.displayName}  [${requestedBy.user.tag}]\``,
								inline: true,
							},
						]);
		}
	}
}

function TimeString(h, m, s)
{
	if (h > 0) return `${h}:${m < 10 ? `0${m}` : m}:${s < 10 ? `0${s}` : s}`;
	return `${m}:${s < 10 ? `0${s}` : s}`;
}

// @flag:need-fixes
function TimeStringText(time)
{
	const arr = time.split(':');
	const out = [];
	for (let i = arr.length - 1; i > -1; i--)
	{
		switch(i)
		{
			case 0:
			{
				out.push(arr[i] + 's');
				break;
			}
			case 1:
			{
				out.push(arr[i] + 'm');
				break;
			}
			case 2:
			{
				out.push(arr[i] + 'h');
				break;
			}
		}
	}

	const sorted = [];
	for (let i = out.length - 1; i > -1; i--)
	{
		sorted.push(out[i]);
	}

	return sorted.join(' ');
}

function ParseURL(input)
{
	const match = input.match(/(?<=v=|v\/|embed\/|be\/)([^&?]+)/g);
	if (match) return match[0];
	return input;
}

// GET: <ytdl.GetBasicInfo>
function Resolve(res)
{
	delete res['isCrawlable'];
	delete res['allowRatings'];
	delete res['latencyClass'];
	delete res['isOwnerViewing'];
	delete res['externalChannelId'];
	delete res['averageRating'];

	return res;
}

function Check(message)
{
	if (!message.member.voice.channel)
	{
		message.channel.send('Please join the VC.');
		return false;
	}
	const Instance = message.client.MusicInstances.get(message.guild.id) ?? {};
	if (Instance.textChannel && Instance.textChannel.id !== message.channel.id)
	{
		message.channel.send(`You are supposed to type the request in <#${Instance.textChannel.id}>`);
		return false;
	}
	if (Instance.voiceChannel && Instance.voiceChannel.id !== message.member.voice.channelID)
	{
		message.channel.send('Join the same voice channel as me to run requests.');
		return false;
	}
	return true;
}

async function SearchVideos(input, limit = 1)
{
	const videos = await ytInstance.searchVideos(ParseURL(input), limit);
	const processed = [];

	for (const video of videos)
	{
		const info = await ytdl.getBasicInfo(video.raw.id.videoId);
		processed.push(Object.assign(Resolve(info.videoDetails), { channelName: video.channel.raw.snippet.channelTitle }));
	}
	return processed;
}
const toggle = arg => arg ? false : true;

module.exports = {
	MusicInstance,
	MusicEmbeds,
	SearchVideos,
	Resolve,
	Check,
};

// GET: <ytInstance.searchVideo> -> v[index].raw.id.videoID;
/** list of properties <ytdl.GetBasicInfo>
[
	'title',
	'lengthSeconds',

	'isFamilySafe',
	'ownerChannelName',
	'videoId',
	'channelId',
	'channelName' <self-assigned>,
	'author',
	'isPrivate',

	'isLiveContent',          'media',
	'age_restricted',         'video_url',
	'thumbnails'

	// livestreams
	'liveBroadcastDetails',
	'isLowLatencyLiveStream',

	// extra <info, stats>
	'description',			'dislikes',
	'publishDate',			'likes',
	'uploadDate',			'keywords',
	'storyboards',			'viewCount',
	'ownerProfileUrl',

	// what
	'isCrawlable',            'averageRating',
	'allowRatings',			  'externalChannelId',
	'latencyClass',			  'isOwnerViewing',
]
*/