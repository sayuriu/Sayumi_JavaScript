const canvas = require('canvas');
const discord = require('discord.js');
const imgur = require('../utils/https/imgur');
const request = require('request');

module.exports = {
	name: 'test',
	flags: ['Under Developement'],
	stable: true,
	usage: 'ooooooaaa <ab> [cd?]',
	usageSyntax: 'wooqawowoaoaod |<this: THIS>|[that: THAT]|<eiowieowew>||[12]|',
	onTrigger: async (message, client) => {

		const redSource = await canvas.loadImage(message.member.user.avatarURL({ format: 'jpg' }));
		const greenSource = await canvas.loadImage(message.member.presence.activities[1].assets.smallImageURL({ format: 'jpg' }));

		const mainCanvas = canvas.createCanvas(130, 130);
		const context = mainCanvas.getContext('2d');

		const redCanvas = canvas.createCanvas(128, 128);
		const redContext = redCanvas.getContext('2d');
		const greenCanvas = canvas.createCanvas(128, 128);
		const greenContext = greenCanvas.getContext('2d');

		redContext.beginPath();
		redContext.arc(64, 64, 64, 0, Math.PI * 2);
		redContext.clip();
		redContext.drawImage(redSource, 0, 0);

		greenContext.beginPath();
		greenContext.arc(64, 64, 64, 0, Math.PI * 2);
		greenContext.clip();
		greenContext.drawImage(greenSource, 0, 0);

		const processedRed = await canvas.loadImage(redCanvas.toBuffer());
		const processedGreen = await canvas.loadImage(greenCanvas.toBuffer());

		context.drawImage(processedRed, 0, 0, 128, 128);
		context.drawImage(processedGreen, 92, 92, 36, 36);

		const image = new discord.MessageAttachment(mainCanvas.toBuffer(), 'test.jpg');
		// message.channel.send(image);

		message.channel.send('`Sending request: Test...`');
		const data = null;
		imgur.Post(mainCanvas.toBuffer());
		request(imgur.Post(mainCanvas.toBuffer()), async (err, res) => {
			if (err) return client.Log.carrier('error', `[Imgur API: Error] ${err.name}\n${err.message}`);
			if (res) console.log(JSON.parse(res.body));
		});

		message.channel.send('Test ended. Please check the console.');
	},
};