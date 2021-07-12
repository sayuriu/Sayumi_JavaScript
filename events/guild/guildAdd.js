module.exports = {
	name: 'guildCreate',
	once: false,
	onEmit: async (client, guild) => {
		client.Log.info(`[Event > Guild Add] I have been added to "${guild.name}"! \nSyncing data...`);
		client.Database.Guild.get(guild);
	},
};