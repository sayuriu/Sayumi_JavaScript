// @deprecated

const Canvas = require('canvas');

module.exports = class Renderers
{
	static async getUserAvatar(user)
	{
		const avatar = await Canvas.loadImage(user.avatarURL({ format: 'jpg' }));

		const userCanvas = Canvas.createCanvas(128, 128);
		const context = userCanvas.getContext('2d');

		context.beginPath();
		context.arc(64, 64, 64, 0, Math.PI * 2);
		context.clip();
		context.drawImage(avatar, 0, 0);

		return userCanvas.toBuffer();
	}

	static PresenceAssets(src, canvas, context)
	{
		// context.lineWidth = 3;
		// context.strokeStyle =
		context.beginPath();
		context.arc(64, 64, 64, 0, Math.PI * 2);
		context.clip();
		context.drawImage(src, 0, 0);
		// context.stroke();

		return canvas.toBuffer();
	}

};