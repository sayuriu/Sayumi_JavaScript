const GuildActions = new (require('../../utils/Database/Methods/guildActions'));
const Logger = new (require('../../utils/Logger'));

module.exports = {
	name: 'guildCreate',
	stable: true,
	once: false,
	onEmit: async (client, guild) => {
		Logger.info(`[Event > Guild Add] I have been added to "${guild.name}"! \nSyncing data...`);
		GuildActions.guildGet(guild);
	},
};