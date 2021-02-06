const { statuses } = require('../utils/json/Responses.json');

module.exports = {
	name: 'ready',
	stable: true,
	once: true,
	onEmit: (client) => {
		client.Log.carrier('connected', client.Methods.Common.Greetings());
		setInterval(() => {
			try {
				client.user.setActivity(client.Methods.Common.Randomize(statuses), { type: 'WATCHING' });
			} catch (error) {
				return client.Log.error(`[Discord > ClientPresence] \n${error.message}`);
			}
		}, 900000);
	},
};