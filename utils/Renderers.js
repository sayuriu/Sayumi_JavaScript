const canvas = require('canvas');

module.exports = class Renderers
{
	static async getUserAvatar(user)
	{
		const avatar = await canvas.loadImage(user.avatarURL({ format: 'jpg' }));

		const userCanvas = canvas.createCanvas(128, 128);
		const context = userCanvas.getContext('2d');

		context.beginPath();
		context.arc(64, 64, 64, 0, Math.PI * 2);
		context.clip();
		context.drawImage(avatar, 0, 0);

		return userCanvas.toBuffer();
	}

	static async getPresenceAssets(assets)
	{
		const assetConvas = canvas.createCanvas(128, 128);
		const context = assetConvas.getContext('2d');

		let largePresenceImage;
		let smallPresenceImage;

		if (assets.smallImage !== null)
		{
			const src = await canvas.loadImage(assets.smallImageURL({ format: 'jpg' }));
			context.beginPath();
			context.arc(64, 64, 64, 0, Math.PI * 2);
			context.clip();
			context.drawImage(src, 0, 0);

			largePresenceImage = assetConvas.toBuffer();
		}
		else if (assets.largeImage !== null)
		{
			const src = await canvas.loadImage(assets.largeImageURL({ format: 'jpg' }));
			context.beginPath();
			context.arc(64, 64, 64, 0, Math.PI * 2);
			context.clip();
			context.drawImage(src, 0, 0);

			smallPresenceImage = assetConvas.toBuffer();
		}
		return { large: largePresenceImage | null, small: smallPresenceImage | null };
	}
};