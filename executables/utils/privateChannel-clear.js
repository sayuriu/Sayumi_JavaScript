module.exports = {
	name: 'public',
    aliases: ['unprivate'],
    description: 'Make current channel public (if this channel is currently private.).',
	reqPerms: 'MANAGE_ROLES',
	reqUser: 'Roles Manager',
	group: ['Server Management', 'Utilities'],
	stable: false,
	guildOnly: true,
	onTrigger: (message) => {
		message.channel.permissionOverwrites.get(message.guild.id).delete()
        .then(() => message.channel.send(`Successfully made channel \`${message.channel.name}\` public.`))
        .catch(console.error);
    },
};