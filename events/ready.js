const Embeds  = require('../utils/embeds');
const Functions = require('../utils/Functions');
const Logger = require('../utils/Logger');
const embeds = new Embeds;
const functions = new Functions;
const logger = new Logger;

module.exports = {
	name: 'ready',
	stable: true,
	onEmit: () => {
		logger.carrier('status: 200', functions.Greetings());
	},
};