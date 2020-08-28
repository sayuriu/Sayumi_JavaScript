const responses = require('../utils/responses.json');
const Functions = require('../utils/Functions');
const Logger = require('../utils/Logger');
const functions = new Functions;
const log = new Logger;

module.exports = {
	name: 'ready',
	stable: true,
	once: true,
	onEmit: (client) => {
		setInterval(() => {
			try {
				client.user.setActivity(functions.Randomized(responses.statuses), { type: 'WATCHING' });
			} catch (error) {
				return log.error(`[Discord > ClientPresence] \n${error.message}`);
			}
		}, 900000);
	},
};