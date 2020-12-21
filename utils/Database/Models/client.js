const Database = require("mongoose");

const client = new Database.Schema({
	_id: Database.Schema.Types.ObjectId,
	host: String,
	shardCount: Number,
	readyAt: Date,
	readyTimestamp: Number,
	ping: Number,
	wsStatus: Number,
	gateway: String | null,
	cmds: Number,
	events: Number,
	cachedUsers: Number,
	cachedGuilds: Number,
}, {
	collection: 'init',
});

module.exports = Database.model('init', client);