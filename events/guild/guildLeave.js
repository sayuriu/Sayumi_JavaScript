module.exports = {
	name: 'guildDelete',	once: false,
	onEmit: async (client, guild) => {
		client.Log.info(`[Event > Guild Remove] I have left "${guild.name}". \nSyncing data...`);
		const data = await client.Database.Guild.get(guild);

		console.log(data);
		// if (data.protected) return client.Log.info('[Database > Guild Remove] Protected guild. Data didn\'t get deleted.');
		// client.Database.Guild.delete(guild);
	},
};