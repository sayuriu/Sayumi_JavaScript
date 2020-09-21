module.exports = {
	name: 'guildCreate',
	stable: true,
	once: false,
	onEmit: async (client, guild) => {
		client.Log.info(`[Event > Guild Add] I have been added to "${guild.name}"! \nSyncing data...`);
		client.GuildDatabase.get(guild);
	},
};