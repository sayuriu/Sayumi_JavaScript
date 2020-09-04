const guildActions = new (require('../../utils/Database/Methods/guildActions'));

module.exports = {
	name: 'prefix',
	guildOnly: true,
	cooldown: 15,
	stable: true,
	args: true,
	usage: '[newPrefix]',
	onTrigger: async (message, args) => {
		const source = await guildActions.guildGet(message.guild);
		const prefix = source.prefix;
		if (!args.length || args.length < 1)
		{
			return message.channel.send(`The current prefix is \`${prefix}\``);
		}
		if (args.length)
		{
			if (!message.member.permissions.has('MANAGE_GUILD'))
			{
				return message.channel.send(`**${message.member.displayName}**, you are lacking permission to do so.`);
			}
			else
			{
				if (args[0].length > 3) return message.channel.send('The new prefix can not be longer than 3 characters. Please try again.');
				guildActions.guildUpdate(message.guild, { prefix: args[0] });
				return message.channel.send(`The prefix has been updated to \`${args[0]}\``);
			}
		}
	},
};