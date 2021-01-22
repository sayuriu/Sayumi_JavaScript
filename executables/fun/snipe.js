module.exports = {
	name: 'graveyard',
	aliases: ['snipe'],
	description: 'Gets last deleted message from a person.',
	group: ['Fun'],
	cooldown: 10,
	args: true,
	usage: "<user>",
	usageSyntax: "|<user: mention | id | name [1]>|",
	onTrigger: async (message, args, client) => {
		if (!args[0]) return message.channel.send('You expected me to scoop up everyone\'s graveyards?');
		const mention = message.mentions.users.first() ||
								await message.guild.users.fetch({ id: args[0] }) ||
								await message.guild.users.fetch({ query: args[0], limit: 1 }).first();

		if (!mention) return message.channel.send('Not found...');
		if (mention.id === client.user.id) return message.channel.send(embed(client.user.tag, 'It\'s a se-cret!'));

		// @bug: 'no user found'
		await message.channel.messages.fetch(null, false, true).then(messages => {
			const target = messages.filter(m => m.author.id === mention.id);

			if (!target) return message.channel.send(embed(mention.tag, 'Nothing in my scopes yet...'));
			// message.channel.send(embed(mention.tag, target.content));
		});
	},
};

const embed = (user, msg) =>
new (require('discord.js').MessageEmbed)().setTitle(user).addField('\u200b', msg).setColor('RANDOM');
