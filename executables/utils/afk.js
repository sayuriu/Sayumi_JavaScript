module.exports = {
	name: 'afk',
	description: 'Set AFK for yourself. Other users will be notified if they ping you.',
	aliases: ['setafk'],
	group: 'Utilities',
	guildOnly: true,
	args: true,
	stable: true,
	usage: '',
	cooldown: 0,
	onTrigger: async (message, args, client) => {
		const source = await client.GuildDatabase.get(message.guild);
		if (source.AFKUsers === false) return message.channel.send(`AFK function is disabled in this server.`);

		let reason;
		if (reason === '') reason = undefined;

		if (args)
		{
			if (args.length === 1) reason = args[0];
			else reason = args.join(' ');
		}

		const userObject = {
			name: message.member.displayName,
			id: message.member.id,
			reason: reason,
			AFKTimeStamp: message.createdTimestamp,
			lastChannel: message.channel.id,
		};

		client.AFKUsers.set(message.author.id, userObject);
		if (message.guild.me.permissions.has('MANAGE_NICKNAMES')) await message.member.setNickname(`[AFK] ${userObject.name}`).catch(err => {message.channel.send('Hmph... Anyway.').then(m => m.delete({ timeout: 2500 })); });
		message.channel.send(`I have set your AFK${reason.length > 0 ? `: ${reason}` : '.'}`).then(m => m.delete({ timeout: 5000 }));
		return;
	},
};