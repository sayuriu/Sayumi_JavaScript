module.exports = {
	name: 'makeprivate',
    aliases: 'privatech',
    description: 'Make current channel private.',
	reqPerms: 'MANAGE_ROLES',
	reqUser: 'Roles Manager',
	group: ['Server Management', 'Utilities'],
	guildOnly: true,
	stable: false,
	onTrigger: (message) => {
		message.channel.replacePermissionOverwrites({
			overwrites: [
				{
					id: message.guild.id,
					deny: ['VIEW_CHANNEL'],
				},
				{
					id: message.client.user.id,
					allow: ['VIEW_CHANNEL'],
				},
				{
					id: message.author.id,
					allow: ['VIEW_CHANNEL'],
				},
			],
		})
		.then(() => message.channel.send(`Successfully made channel \`${message.channel.name}\` private.`))
		.catch(console.error);
	},
};