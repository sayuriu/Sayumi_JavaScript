const GuildSchema = require('../Models/guild');
const Logger = require('../../Logger');
const Database = require('mongoose');
const defaultSettings = require('../../DefaultGlobalSettings.json');

const log = new Logger;

module.exports = class GuildDatabase {

	async guildAdd(guild)
	{
		const GuildObject = {
			_id: Database.Types.ObjectId(),
			guildName: guild.name,
			guildID: guild.id,
			AllowedReplyOn: [guild.channels.find(ch => ch.name.includes('bot') || ch.name.includes('general'))],
		};
		const newGuild = await new GuildSchema(GuildObject);
		return newGuild.save().then(() => {
			log.info(`New settings saved for guild ${guild.name} [ID${guild.id}]`);
		});
	}

	async guildGet(guild)
	{
		const data = await GuildSchema.findOne({ guildID: guild.id });
		if (data) return data;
		else if (!data) this.guildAdd(guild);
		return this.guildGet(guild);
	}

	async guildDelete(guild)
	{
		try {
			await GuildSchema.findOneAndDelete({ guildID: guild.id });
		} catch (error) {
			log.error(`[Database > Guild Removal] An error has occured while removing the data: \n${error.message}`);
		}
	}
};