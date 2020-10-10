const fetch = require('node-fetch');

module.exports = {
	name: 'apod',
	description: 'Get Astronomy Picture of the Day.',
	stable: true,
	args: true,
	group: 'NASA',
	cooldown: 1440000,
	usage: '[date? YYYY-MM-DD]',
	onTrigger: async (message, args, client) => {
		const url = `https://api.nasa.gov/planetary/apod?api_key=${client.APIs.nasa}${args[0] ? `&date=${args[0]}` : ''}`;

		try {
			await fetch(url).then(async out => {
				const header = out[Object.getOwnPropertySymbols(out)[1]];
				const data = await out.json();

				if (header.status !== 200)
				{
					const error = {
						status: header.status,
						statusText: header.statusText,
						code: data.error ? data.error.code : null,
						message: data.error ? data.error.message : null,
					};

					let embed;

					if (error.code && error.message) embed = client.Embeds.nasa_apod(null, error).error;
					else embed = client.Embeds.nasa_apod(null, error).errorShort;
					return message.channel.send(embed);
				}

				const embed = client.Embeds.nasa_apod(data, null).response;

				message.channel.send(embed).then(async m => {
					await m.react('🌎');
					await m.awaitReactions(filter, { max: 1, time: 45000, errors: ['time'] })
						.then(async received => {
							const reaction = await received.first();
							if (reaction)
							{
								const edited = client.Embeds.nasa_apod(data, null).response;
								if (data.media_type === 'image') edited.setDescription(`*${data.explanation}*\n\n[Image link](${data.hdurl} 'Full-resolution link of the image.')`);
								else if (data.media_type === 'video') edited.setDescription(`*${data.explanation}*`);
								await m.edit(edited);
							}
						})
						.catch(i => {
							const edited = client.Embeds.nasa_apod(data, null).edited;
							return m.edit(edited);
						});
				});
			});

			const filter = (reaction, user) => {
				return ['🌎'].includes(reaction.emoji.name) && user.id === message.author.id;
			};

		} catch (error) {
			const err = {
				status: error.status,
				statusText: error.statusText,
			};
			message.channel.send(client.Embeds.nasa_apod(null, err).errorShort);
		}
	},
};