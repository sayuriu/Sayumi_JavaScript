module.exports = {
	name: 'say',
	aliases: ['copy', 'parrot', 'iu', 'asay'],
	group: 'Emotes',
	description: 'Saying on my behalf.',
	guildOnly: true,
	args: true,
	usage: '<any>',
	reqPerms: 'MANAGE_MESSAGES',
	reqUser: 'Anyone with the permission flagged above.',
	onTrigger: async (message, args, client) => {
		if (!args.length) return;
		const targetChannel = message.mentions.channels.first();

		try {
			client.Messages.set(message.id, { msgID: message.id, flagNoDelete: true });
			message.delete();

			if (targetChannel && targetChannel.permissionsFor(client.id).has('SEND_MESSAGES')) return message.channel.send(args.join(' '));
			message.channel.send(args.join(' '));
		} catch (error) {
			return;
		}
	},
};