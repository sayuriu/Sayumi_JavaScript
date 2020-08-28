const GuildActions = new (require('../../utils/Database/Methods/guildActions'));
const Logger = new (require('../../utils/Logger'));

module.exports = {
	name: 'guildDelete',
	stable: true,
	once: false,
	onEmit: async (client, guild) => {
		Logger.info(`[Event > Guild Remove] I have left "${guild.name}". \nSyncing data...`);
		GuildActions.guildDelete(guild);
	},
};