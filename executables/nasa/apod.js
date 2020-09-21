const discord = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
	name: 'apod',
	description: 'Get Astronaut\'s Picture of the Day.',
	stable: true,
	group: 'NASA',
	cooldown: 1440000,
	onTrigger: async (message, client) => {
		try {
			let data;
			await fetch(`https://api.nasa.gov/planetary/apod?api_key=${client.APIs.nasa}`)
										.then(async out => { data = await out.json(); });

			const embed = new discord.MessageEmbed()
									.setColor("#0033FF")
									.setTitle(data.title)
									.setDescription(`[Image link](${data.hdurl} 'Full-resolution link of the image.')`)
									.setFooter('From NASA')
									.setImage(data.hdurl)
									.setFooter(`${data.copyright} | ${data.date}\nReact to the emoji below to display image's description.`);

			message.channel.send(embed).then(m => {
				m.react('🌎');
				m.awaitReactions(filter, { max: 1, time: 45000, errors: ['time'] })
					.then(received => {
						const reaction = received.first();
						if (reaction)
						{
							const edited = new discord.MessageEmbed()
													.setColor("#0033FF")
													.setTitle(data.title)
													.setDescription(`*${data.explanation}*\n\n[Image link](${data.hdurl} 'Full-resolution link of the image.')`)
													.setFooter('From NASA')
													.setImage(data.hdurl)
													.setFooter(`${data.copyright} | ${data.date}`);
							m.edit(edited);
						}
					})
					.catch(i => {
						const edited = new discord.MessageEmbed()
													.setColor("#0033FF")
													.setTitle(data.title)
													.setDescription(`*${data.explanation}*\n\n[Image link](${data.hdurl} 'Full-resolution link of the image.')`)
													.setFooter('From NASA')
													.setImage(data.hdurl)
													.setFooter(`${data.copyright} | ${data.date}\nThis message is now inactive.`);
						return m.edit(edited);
					});
			});

			const filter = (reaction, user) => {
				return ['🌎'].includes(reaction.emoji.name) && user.id === message.author.id;
			};

		} catch (error) {
			console.log(error);
		}
	},
};