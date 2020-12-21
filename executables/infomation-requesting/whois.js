// Props
const { MessageEmbed } = require('discord.js');
const canvas = require('canvas');
const request = require('request');

const activityType = require('../../utils/json/ActivityType.json');
const userStatus = require('../../utils/json/UserStatus.json');
const Renderers = require('../../utils/Renderers');
const imgur = require('../../utils/https/imgur');

module.exports = {
	name: 'whois',
	description: '',
	group: ['Information'],
	flags: ['Under Developement'],
	stable: true,
	guildOnly: true,
	cooldown: 10,
	args: true,
	usage: '[user?: direct tag / ID]',
	onTrigger: async (message, args, client) => {

		// Get user
		if (!args[0]) args[0] = `<@!${message.author.id}>`;

		let _id;
		let confirm = false;

		const userID = args[0].match(/^<?@?!?(\d+)>?$/);
		if (userID !== null)
		{
			_id = userID[1];
			confirm = true;
		}
		else if (!userID) _id = null;

		let target;

		if (_id) target = await message.guild.members.fetch({ user: _id, force: true });
		if (!target) target = await message.guild.members.fetch({ query: args[0], limit: 1 });

		if (target.size < 1) return message.channel.send('No such user matches your request.');
		if (confirm === false) target = target.first();
		const { activities, clientStatus: clientDevice, status } = target.presence;

		let largePresenceImage, smallPresenceImage = null;

		// Generate embed (1)
		const embed = new MessageEmbed()
								.setTitle(`${target.user.username}#${target.user.discriminator}${target.nickname ? `, aka. ${target.nickname}` : ''}`)
								.setDescription(`\`| ID <${target.id}>\` ${userStatus.status.emojis[status]} \`${userStatus.status.text[status]}${clientDevice ? `, Client:\` ${userStatus.devices.icons[Object.keys(clientDevice)[0]]}` : '`'}`)
								.setTimestamp()
								.setThumbnail(target.user.avatarURL())
                                .setColor('RANDOM');

		// Get presence data
		if (activities.length > 0)
		{
			let activityString = '';
			let index = 0;

			activities.forEach(activity => {
				index++;

				const name = activity.name;
                const emoji = activity.emoji;
                const type = activity.type;
                const url = activity.url;
                const details = activity.details;
                const state = activity.state;
				const appID = activity.applicationID;
                const timestamps = activity.timestamps;
                const party = activity.party;
                const assets = activity.assets;
				const createdTimestamp = activity.createdTimestamp;

				if (type === 'CUSTOM_STATUS')
				{
					const userString = `\`| ID <${target.id}> |\` ${userStatus.status.emojis[status]} \`${userStatus.status.text[status]}${clientDevice ? `, Client:\` ${userStatus.devices.icons[Object.keys(clientDevice)[0]]}` : '`'}\n${emoji ? emoji.name : ''}*"${state}"*`;
					return embed.setDescription(userString);
				}
				else
				{
					// Message rendering
					const header = `(${activityType[type]}) \`${name}${state ? `: ${state}` : ''}\``;
                    const body = `${details ? `> ${details}` : ''}${assets ? `\n${assets.largeText}` : ''}`;

					if (index === 0) activityString += `${header}\n${body}`;
					if (index > 0) activityString += `\n${header}\n${body}`;

					// Grab data
					if (assets)
					{
						if (assets.largeImage) largePresenceImage = { link: assets.largeImageURL({ format: 'jpg' }) };
						if (assets.smallImage) smallPresenceImage = { link: assets.smallImageURL({ format: 'jpg' }) };
					}
				}
			});
		}

		// Rendering images

			// Main
			const mainCanvas = canvas.createCanvas(130, 130);
			const mainContext = mainCanvas.getContext('2d');

			// Avatar
			const avatarImage = await canvas.loadImage(target.user.avatarURL({ format: 'jpg' }));
			const avatarCanvas = canvas.createCanvas(128, 128);
			const avatarContext = avatarCanvas.getContext('2d');

			avatarContext.beginPath();
			avatarContext.arc(64, 64, 64, 0, Math.PI * 2);
			avatarContext.clip();
			avatarContext.drawImage(avatarImage, 0, 0);

			// Render the avatar first
			const avatar = await canvas.loadImage(avatarCanvas.toBuffer());
			mainContext.drawImage(avatar, 0, 0);

			// Presence data
			if (largePresenceImage)
			{
				const LICanvas = canvas.createCanvas(128, 128);
				const LIcontext = LICanvas.getContext('2d');

				const src = await canvas.loadImage(largePresenceImage.link);

				largePresenceImage.data = Renderers.PresenceAssets(src, LICanvas, LIcontext);
			}

			if (smallPresenceImage)
			{
				const SICanvas = canvas.createCanvas(128, 128);
				const SIcontext = SICanvas.getContext('2d');

				const src = await canvas.loadImage(smallPresenceImage.link);

				smallPresenceImage.data = Renderers.PresenceAssets(src, SICanvas, SIcontext);
			}

		// Render on Main
		if (smallPresenceImage)
		{
			const SI = await canvas.loadImage(smallPresenceImage.data);
			mainContext.drawImage(SI, 92, 92, 36, 36);
		}
		else if (largePresenceImage)
		{
			const LI = await canvas.loadImage(largePresenceImage.data);
			mainContext.drawImage(LI, 92, 92, 36, 36);
		}

		// If no presence data, let's use their status instead!
		else
		{
			const IconCanvas = canvas.createCanvas(128, 128);
			const IconContext = IconCanvas.getContext('2d');

			IconContext.beginPath();
			IconContext.arc(64, 64, 64, 0, Math.PI * 2);
			IconContext.clip();

			IconContext.fillStyle = userStatus.colors[status];
			IconContext.fill();

			const statusIcon = await canvas.loadImage(IconCanvas.toBuffer());
			mainContext.drawImage(statusIcon, 92, 92, 36, 36);
		}

		// Pull request as you upload the picture
		let data = null;

		// Roles
        const roles = target.roles.cache;
		embed.addField(`Roles \`${roles.size}\``, roles.map(role => `<@&${role.id}>`));

		// Join dates
		embed.addField('Dates', `Created on \`${target.user.createdAt.toUTCString().substr(0, 16)}\`\nJoined on \`${target.joinedAt.toUTCString().substr(0, 16)}\``);

		// Request (last)
		request(imgur.Post(mainCanvas.toBuffer()), async (err, res) => {

			if (err) message.client.Log.carrier('error', `[Imgur API: Error] ${err.name}\n${err.message}`);

			if (res)
			{
				data = await JSON.parse(res.body);

				// Generate the embed (2)
				if (data !== null) embed.setThumbnail(data.data.link);
				if (smallPresenceImage && largePresenceImage !== null) embed.setFooter(null, largePresenceImage.link);
				return message.channel.send(embed).catch(err => console.error(err));
			}
		});
	},
};