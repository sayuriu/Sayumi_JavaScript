// const superagent = require('superagent');
const { MessageEmbed: EmbedConstructor } = require('discord.js');
const { version, dependencies } = require('../../package.json');

module.exports = {
	name: 'about',
	aliases: ['info'],
	description: 'About me!',
	group: ['Information'],
	cooldown: 15,
	onTrigger: async (message, client) => {

		const stringLimiter = client.Methods.Common.StringLimiter;

		let prefix = 's!';
		if (message.guild)
		{
			const guild = await client.GuildDatabase.get(message.guild);
			prefix = guild.prefix;
		}

		const thisVersions = [
			'`sayumi:`',
			`\`- ${stringLimiter('main:', version, ' ', 30)}\``,
			`\`- ${stringLimiter('sayuri:handlers:', '1.5.13b', ' ', 30)}\``,
			`\`- ${stringLimiter('sayuri:ws:', '0.1.23', ' ', 30)}\``,
			`\`- ${stringLimiter('sayuri:runtime:', '1.1.10', ' ', 30)}\``,
		];
		const otherver = [
			`\`${stringLimiter('node:', `v.${process.version}`, ' ', 30)}\``,
			`\`${stringLimiter('discord.js:', dependencies['discord.js'].replace(/\^/g, 'v.'), ' ', 30)}\``,
			`\`${stringLimiter('discordjs:opus:', dependencies['@discordjs/opus'].replace(/\^/g, 'v.'), ' ', 30)}\``,
			`\`${stringLimiter('express:', dependencies['express'].replace(/\^/g, 'v.'), ' ', 30)}\``,
		];

		const embed = new EmbedConstructor()
				.setTitle('About')
				.setURL(client.user.displayAvatarURL())
				.setColor('#42f5f5')
				.setThumbnail(client.user.displayAvatarURL())
				.setDescription(`\`Sayumi#9497, processID [${client.Methods.Common.RandomHex8()}]\`\n*I'm still under development, so things may not work as expected. \nType \`${prefix}help\` for help index or blame Sayuri if you found errors.*`)
				.addField('Birthdate', `\`${client.user.createdAt.toUTCString().substr(0, 16)}\``, true)
				.addField('Creator', "[`Sayuri#1222`](https://github.com/u-sayuri 'Link to my creator's GitHub.')", true)
				.addField('Prefix', `\`Mention or ${prefix}\``, true)
				.addField('Libs used', `${thisVersions.join('\n')}\n${otherver.join('\n')}`);

		message.channel.send(embed);
	},
};
