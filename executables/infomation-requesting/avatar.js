const { MessageEmbed: EmbedConstructor } = require('discord.js');
const splashy = require('splashy');

module.exports = {
	name: 'avatar',
	aliases: ['ava'],
	description: 'Gets users\' avatars.',
	group: ['Information', 'Utilities'],
	cooldown: 10,
	args: true,
	usage: 'user',
	usageSyntax: '|[user: User (Direct tag or ID, max 1)]|',
	onTrigger: (message, args, client) => {

		if (!args[0]) return message.channel.send(avatarImage(message.author));

		const calledUser = message.mentions.user.first()
						|| message.guild.members.fetch({ user: args[0], force: true })
						|| message.guild.members.fetch({ query: args[0], limit: 1 }).first();

		if (!calledUser) return message.channel.send('Couldn\'t find that user.');
		message.channel.send(avatarImage(calledUser.user));
	},
};

async function avatarImage(user)
{
	this.avatarImage = user.displayAvatarURL();
	this.usertag = `${user.username}\`#${user.discriminator}\``;

	const colours = await splashy(this.avatarImage);
	return new EmbedConstructor()
				.setTitle(this.usertag)
				.setColor(colours[Math.round(Math.random() * colours.length)])
				.setURL(this.avatarImage)
				.setImage(this.avatarImage);
}
