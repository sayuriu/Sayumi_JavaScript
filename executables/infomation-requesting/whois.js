// Props
const { MessageEmbed } = require('discord.js');
const canvas = require('canvas');
const request = require('request');

const activityType = require('../../utils/json/ActivityType.json');
const userStatus = require('../../utils/json/UserStatus.json');
const imgur = require('../../utils/https/imgur');

require('fs');

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

		const userID = args[0].match(/^<?@?!?(\d+)>?$/) ? args[0].match(/^<?@?!?(\d+)>?$/)[1] : null;
		let target;

		if (userID) target = await message.guild.members.fetch({ user: userID, force: true });
		if (!target) target = await message.guild.members.fetch({ query: args[0], limit: 1 }).first();

		if (target.size < 1) return message.channel.send('No such user matches your request.');

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
			activityString;
		}

		// Pull request as you upload the picture
		let data = null;

		// Roles
        const roles = target.roles.cache;
		embed.addField(`Roles \`${roles.size}\``, roles.map(role => `<@&${role.id}>`));

		// Join dates
		embed.addField('Dates', `Created on \`${target.user.createdAt.toUTCString().substr(0, 16)}\`\nJoined on \`${target.joinedAt.toUTCString().substr(0, 16)}\``);

		// Render & request

		new UsersCanvasRenderer(target, largePresenceImage, smallPresenceImage, status).render().then(imageBuffer => {
			request(imgur.Post(imageBuffer), async (err, res) => {

				if (err)
				{
					message.client.Log.carrier('error', `[Imgur API: Error] ${err.name}\n${err.message}`);
					message.channel.send(embed).catch(err => console.error(err));
				}

				if (res)
				{
					data = await JSON.parse(res.body);

					// Generate the embed (2)
					if (data) embed.setThumbnail(data.data.link);
					if (smallPresenceImage && largePresenceImage) embed.setFooter(null, largePresenceImage.link);
					return message.channel.send(embed).catch(err => console.error(err));
				}
			});
		});
	},
};

class UsersCanvasRenderer
{
	constructor(target)
	{
		this.avatar = target.user.avatarURL({ format: 'jpg' });
		this.status = target.presence.status;
		this.activities = target.presence.activities;

		this.mainCanvas = canvas.createCanvas(130, 130);
		this.mainCanvasCxt = this.mainCanvas.getContext('2d');
	}

	getPresenceAssets()
	{
		if (this.activities.length > 0)
		{
			const prioritizedActivity = this.activities.find(activity => activity.assets && activity.assets.smallImage && activity.assets.largeImage);
			if (prioritizedActivity)
			{
				this.largePresenceImage = prioritizedActivity.assets.largeImageURL({ format: 'jpg' });
				this.smallPresenceImage = prioritizedActivity.assets.smallImageURL({ format: 'jpg' });
			}
			else
			{
				this.activities.forEach(activity => {
					if (activity.assets)
					{
						if (activity.assets.smallImage) this.smallPresenceImage = activity.assets.smallImageURL({ format: 'jpg' });
						if (activity.assets.largeImage) this.largePresenceImage = activity.assets.largeImageURL({ format: 'jpg' });
					}
				});
			}
		}
	}

	async render()
	{
		this.getPresenceAssets();

		const image = await canvas.loadImage(this.avatar);
		const avatarCanvas = canvas.createCanvas(128, 128);
		const avatarContext = avatarCanvas.getContext('2d');

		avatarContext.beginPath();
		avatarContext.arc(64, 64, 64, 0, Math.PI * 2);
		avatarContext.clip();
		avatarContext.drawImage(image, 0, 0);

		const finalized = await canvas.loadImage(avatarCanvas.toBuffer());
		this.mainCanvasCxt.drawImage(finalized, 0, 0);
		await this.renderStatusIcons();
		return this.mainCanvas.toBuffer();
	}

	async renderStatusIcons()
	{
		if (this.smallPresenceImage)
			await canvas.loadImage(this.smallPresenceImage).then(async img => {
				const src = await canvas.loadImage(this.renderStatusIcon(1, img));
				this.mainCanvasCxt.drawImage(src, 92, 92, 36, 36);
			});

		else if (this.largePresenceImage)
			await canvas.loadImage(this.largePresenceImage).then(async img => {
				const src = await canvas.loadImage(this.renderStatusIcon(1, img));
				this.mainCanvasCxt.drawImage(src, 92, 92, 36, 36);
			});

		else await canvas.loadImage(this.renderStatusIcon(2)).then(img => this.mainCanvasCxt.drawImage(img, 92, 92, 36, 36));
	}

	renderStatusIcon(type = 2, img = null)
	{
		if (!img) type = 2;
		const CANVAS = canvas.createCanvas(128, 128);
		const CXT = CANVAS.getContext('2d');

		CXT.beginPath();
		CXT.arc(64, 64, 64, 0, Math.PI * 2);
		CXT.clip();

		switch (type)
		{
			case 1:
			{
				CXT.drawImage(img, 0, 0);
				return CANVAS.toBuffer();
			}
			case 2:
			{
				CXT.fillStyle = userStatus.colors[this.status];
				CXT.fill();
				return CANVAS.toBuffer();
			}
		}
	}
}