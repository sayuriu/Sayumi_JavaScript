module.exports = {
	name: 'ready',
	stable: true,
	onEmit: (client) => {
		client.Log.carrier('status: 200', client.Methods.Greetings());
	},
};