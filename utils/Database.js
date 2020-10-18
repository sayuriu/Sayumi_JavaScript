const db = require('mongoose');
const log = require('./Logger');
let failedOnline = false;
let failedLocal = false;

/**
 * Provides basic actions and connections to MongoDB.
 * @param {object} data [Object] Contains `local (boolean)`, `username`, and `password`.
*/
module.exports = class Database {
	constructor(data)
	{
		const { local, dbUsername: username, dbPassword: password } = data;

		/** Initiates the connection. */
		this.Init = () => {
			this.Connect(local, username, password);
		};

		/** If failed to connect, use local. */
		this.onRefusedConnection = (fail) =>
		{
			if (fail) return this.Connect(true);
		};
	}

	/** Initiates the connection.
	 * @param {boolean} local If this project decides to use local database (stored on this machine).
	 * @param {string} username The username for the remote database.
	 * @param {string} password The password associated with the username.
	 * See {@link https://www.mongodb.com/ [MongoDB]}
	 */
	Connect(local, username, password)
	{
		if (local)
		{
			db.connect(`mongodb://localhost/sayumi`, {
				useNewUrlParser: true,
				useUnifiedTopology: true,
			});
			const Connection = db.connection;
			this.HandleConnection(Connection, true);
		}
		else
		{
			db.connect(`mongodb+srv://${username}:${password}@main-ftdmd.azure.mongodb.net/sayumi`, {
				useNewUrlParser: true,
				useUnifiedTopology: true,
				family: 0,
			});
			const Connection = db.connection;
			this.HandleConnection(Connection, false, username);
		}
	}

	/** Handles basic events of a connection.
	 * @param {*} connection The connection instance of MongoDB.
	 * @param {boolean} local If the connection is to local host.
	 * @param {string} username The username for the remote database.
	 */
	HandleConnection(connection, local, username)
	{
		if (local)
		{
			connection.once('open', () => {
				log.carrier('status: > Local Database', 'Using this machine as the host.');
			});
			connection.on('error', error => {
				log.error(`[Local Database > mongoDB] A connection error has occured: \n"${error.message}"`);
			});
		}
		else
		{
			connection.once('open', () => {
				if (!failedOnline) log.carrier('status: > Remote Database', `Status 200: Connected as "${username}"`);
			});
			connection.on('error', error => {
				log.error(`[Remote Database > mongoDB] A connection error has occured: \n"${error.message}"`);
				log.carrier('status: 500', 'This will use localhost instead.');

				if (failedOnline) return this.onRefusedConnection(true);
				failedOnline = true;

				if (local && failedLocal) return;
				if (local) log.warn('[Local Database] Failed to connect to localhost. Incoming connection errors will be ignored.');
				failedLocal = true;

				return this.Init();
			});
		}
		connection.on('disconnected', () => {
			log.carrier('status: 0', `Disconnected from ${local ? 'local database' : 'remote database'}.`);
		});
	}
};