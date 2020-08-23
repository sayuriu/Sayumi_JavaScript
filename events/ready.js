const Embeds  = require('../utils/embeds');
const Functions = require('../utils/Functions');
const embeds = new Embeds;
const functions = new Functions;

module.exports = {
	name: 'ready',
	stable: true,
	onEmit: (client) => {
		functions.log('status', 'Good evening!');
		// client.channels.cache.find(ch => ch.id === '731918444085379142').send(embeds.update('Carriers', 'Optimized and improved command / event handlers'));
	},
};