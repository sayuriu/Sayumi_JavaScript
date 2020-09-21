const responses = require('../utils/json/responses.json');

module.exports = {
	name: 'ready',
	stable: true,
	once: true,
	onEmit: (client) => {
		setInterval(() => {
			try {
				client.user.setActivity(client.Methods.Randomized(responses.statuses), { type: 'WATCHING' });
			} catch (error) {
				return client.Log.error(`[Discord > ClientPresence] \n${error.message}`);
			}
		}, 900000);
	},
};