module.exports = {
	name: 'guildDelete',
	stable: true,
	once: false,
	onEmit: async (client, guild) => {
		client.Log.info(`[Event > Guild Remove] I have left "${guild.name}". \nSyncing data...`);
		const data = await client.GuildDatabase.get(guild);

		console.log(data);
		// if (data.protected) return client.Log.info('[Database > Guild Remove] Protected guild. Data didn\'t get deleted.');
		// client.GuildDatabase.delete(guild);
	},
};