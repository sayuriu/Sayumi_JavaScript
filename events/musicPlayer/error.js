module.exports = {
	name: 'error',
	music: true,
	onEmit: (client, error, { channel }) => {

		const notifyHTTPError = (code) => {

			let name = '';
			switch(code) {
				case 400: name = ' [BAD REQUEST]'; break;
				case 403: name = ' [FORBIDDEN]'; break;
				case 404: name = ' [NOT FOUND]'; break;
				case 408: name = ' [REQUEST TIMEOUT]'; break;
				case 500: name = ' [INTERNAL SERVER ERROR]'; break;
				case 502: name = ' [BAD GATEWAY]'; break;
				default: break;
			}
			return channel.send(`Received HTTP error: ${name}${code}`);
		};

		switch (error) {
			case 'MusicStarting':
				// condition: no voice connection / dispatcher | not sure how to replicatte
				channel.send('Setting up voice connection, please try that command again.');
				return console.log("e: MusicStarting");
			case 'NotConnected':
				return channel.send('I\'m not connected to a voice channel!');
			case 'UnableToJoin':
				return channel.send('I can\'t join this channel!');
			case 'NotPlaying':
				return channel.send('There\'s nothing being played!');
			case 'LiveVideo':
				return channel.send('I don\'t have extra processing power for playing live videos though, sorry...');
			default:
			{
				const httpError = detectHTTPError(error);
				if (httpError) return HandleHTTPError(httpError[0], notifyHTTPError);

				return channel.send('Oopsie daisie! Something went wrong with the player! Logging error...').then(m => {
					client.Log.error('[MusicPlayer]' + `\n${error.stack}`);
					m.edit('Oopsie daisie! Something went wrong with the player. Error noted, sorry for the trouble!');
				});
			}
		}
	},
};

function detectHTTPError(e)
{
	const statusCodeRegex = /status code (\d+)/g;
	return e.stack.toLowerCase().match(statusCodeRegex) ?? [];
}

function HandleHTTPError(string, callback) {
	const code = string.match(/\d+/)[0];
	return callback(parseInt(code));
}
