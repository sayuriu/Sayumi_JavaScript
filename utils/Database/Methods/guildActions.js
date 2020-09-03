const GuildSchema = require('../Models/guild');
const Logger = require('../../Logger');
const Database = require('mongoose');
const DefaultSettings = require('../../../utils/DefaultGlobalSettings.json');

const log = new Logger;

module.exports = class GuildDatabase {

	async guildAdd(guild)
	{
		const GuildObject = {
			_id: Database.Types.ObjectId(),
			guildName: guild.name,
			guildID: guild.id,
			AllowedReplyOn: [guild.channels.cache.find(ch => ch.name.includes('bot') || ch.name.includes('general'))],
		};
		const newGuild = await new GuildSchema(GuildObject);
		return newGuild.save().then(() => {
			log.info(`[Guild Add] New settings saved for guild "${guild.name}" [ID${guild.id}]`);
		});
	}

	async guildDelete(guild)
	{
		try {
			await GuildSchema.findOneAndDelete({ guildID: guild.id });
		} catch (error) {
			log.error(`[Database > Guild Removal] An error has occured while removing the data: \n${error.message}`);
		}
	}

	async guildGet(guild)
	{
		const data = await GuildSchema.findOne({ guildID: guild.id });
		if (data) return data;
		else if (!data)
		{
			this.guildAdd(guild);
			return DefaultSettings;
		}
	}

	async guildUpdate(guild, settings)
	{
		if (typeof settings !== 'object') return log.error('[Guild Update] The setting passed in is not an object.');
		const data = await this.guildGet(guild);
		for (const key in settings)
		{
			if (Object.prototype.hasOwnProperty.call(settings, key))
			{
				if (data[key] !== settings[key]) data[key] = settings[key];
				else return;
			}
		}

		return await data.updateOne(settings);
	}
};