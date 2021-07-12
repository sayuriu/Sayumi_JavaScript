module.exports = {
	name: 'uptime',
	description: 'Shows how long is it sice last boot.',
	group: ['Information'],
    aliases: ['runtime'],
	onTrigger: (message, client) => {
		const days = Math.floor(client.uptime / 86400000);
		const hours = Math.floor(client.uptime / 3600000) % 24;
		const minutes = Math.floor(client.uptime / 60000) % 60;
		const seconds = Math.floor(client.uptime / 1000) % 60;

		let UpTime = "";
		if(days > 0) {
			UpTime += `${days} day` + (days > 1 ? "s" : "") + `, `;
		}
		if(hours > 0 || days > 0) {
			UpTime += `${hours} hour` + (hours > 1 ? "s" : "") + `, `;
		}
		if(minutes > 0 || hours > 0 || days > 0) {
			UpTime += `${minutes} minute` + (minutes > 1 ? "s" : "") + ` and `;
		}
		UpTime += `${seconds} second` + (seconds > 1 ? "s" : "");

        const options1 = [`It's about ${UpTime}. Do not close the terminal.`, `It says ${UpTime} on my clock. Isn't that right?`, `${UpTime}... Or should I say that's how long since the last time you refreshed the terminal.`, `My consciousness has last for ${UpTime}, and counting.`];
		const options2 = [`Heh? If you're asking about my uptime...It's about ${UpTime} since my last online. *Note that my status depends on Sayuri's terminal. If that terminal closes, I'll go offline as well.*`, `Hmmmmmm, that's ${UpTime}.`, `${UpTime}.`, `I've been online for ${UpTime} since last terminal reset.`];

		const response1 = options1[Math.floor(Math.random() * options1.length)];
		const response2 = options2[Math.floor(Math.random() * options2.length)];

		if(message.author.id !== "520964894279860224") {
			return message.channel.send(response2);
		}
		message.channel.send(response1);
	},
};