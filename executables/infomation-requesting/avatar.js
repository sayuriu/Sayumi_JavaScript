const { MessageEmbed: EmbedConstructor } = require('discord.js');

module.exports = {
	name: 'avatar',
	aliases: ['ava'],
	description: 'Gets users\' avatars.',
	group: ['Information', 'Utilities'],
	cooldown: 10,
	args: true,
	usage: 'user',
	usageSyntax: '|[user: User (Direct tag or ID, max 1)]|',
	onTrigger: async (message, args, client) => {

		// if (!args[0]) return message.channel.send(avatarEmbed(message.author, await splashy(this.avatarImage)));

		const calledUser = message.mentions.users.first()
						|| await message.guild.members.fetch({ id: args[0], force: true })
						|| await message.guild.members.fetch({ query: args[0], limit: 1 }).first();

		const send = async () => {
			if (!calledUser) return message.channel.send('Couldn\'t find that user.');
			// message.channel.send(avatarEmbed(calledUser.user, await splashy(calledUser.user.displayAvatarURL({ format: 'jpg' }))));
		};

		return await send();
	},
};

function avatarEmbed(user, colourSet)
{
	this.avatarImage = user?.displayAvatarURL({ format: 'jpg' });
	this.usertag = `${user.username}\`#${user.discriminator}\``;

	return new EmbedConstructor()
				.setTitle(this.usertag)
				.setColor(colourSet[Math.round(Math.random() * colourSet.length)])
				.setURL(this.avatarImage)
				.setImage(this.avatarImage);
}