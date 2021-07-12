module.exports = {
	name: 'guildfetch',
	description: 'Renew your guild settings (on demand).\nUse this command when you see some settings that are not matched up.',
	group: ['Server Management'],
	reqPerms: 'MANAGE_GUILD',
	reqUser: 'Guild Manager',
	onTrigger: ({ guild, channel }, client) => {
		client.Database.Guild.loadFromCache(guild).then(() => channel.send('Server cache data updated.'));
	},
};