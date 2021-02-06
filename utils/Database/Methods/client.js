const InitSchema = require('../models/client');
const Database = require('mongoose');
const logger = require('../../Logger');

module.exports = class Initialize
{
	async init(client)
	{
		const obj = {
			_id: Database.Types.ObjectId(),
			host: `${process.env.USERDOMAIN} as ${process.env.USERNAME}`,
			shardCount: client.ws.totalShards,
			readyAt: client.readyAt,
			readyTimestamp: client.readyTimestamp,
			ping: client.ws.ping,
			wsStatus: client.ws.status,
			gateway: client.ws.gateway,
			cmds: client.CommandList.size,
			events: parseInt(process.env.HANDLED_EVENTS) || 0,
			cachedUsers: client.users.cache.size,
			cachedGuilds: client.guilds.cache.size,
		};

		const form = await new InitSchema(obj);
		return form.save({}, (err) => {
			// if (err) return logger.error(`[Database > Client Init Sync] ${err}`);
			if (err) return logger.carrier('error', `[Database > Client Init Sync] ${err}`);
		});
	}
};