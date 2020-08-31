const Embeds  = require('../utils/embeds');
const Functions = require('../utils/Functions');
const Logger = require('../utils/Logger');
const embeds = new Embeds;
const functions = new Functions;
const logger = new Logger;

module.exports = {
	name: 'ready',
	stable: true,
	onEmit: (client) => {
		logger.carrier('status: 200', functions.Greetings());

		// client.channels.cache.find(ch => ch.id === '731918444085379142').send(embeds.update('Database', 'Implemented basic database operations and message handing'));
	},
};