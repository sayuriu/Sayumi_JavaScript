const { connect, connection } = require('mongoose');
const { warn, error: outerr, carrier } = require('./Logger');
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
		this.Init = () => this.Connect(local, username, password);
		this.retires = -1;

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
		const RetryConnection = (e) =>
		{
			if (e.message === 'connection timed out')
			{
				if (this.retires > 3) return outerr(`${'a'}`);
				this.retires++;
				return this.Connect(local, username, password);
			}
		};

		if (local)
		{
			connect(`mongodb://localhost/sayumi`, {
				useNewUrlParser: true,
				useUnifiedTopology: true,
			}).catch(e => RetryConnection(e));
			const Connection = connection;
			this.HandleConnection(Connection, true);
		}
		else
		{
			connect(`mongodb+srv://${username}:${password}@main-ftdmd.azure.mongodb.net/sayumi`, {
				useNewUrlParser: true,
				useUnifiedTopology: true,
				family: 0,
			}).catch(e => RetryConnection(e));
			const Connection = connection;
			this.HandleConnection(Connection, false, username);
		}
	}


	/** Handles basic events of a connection.
	 * @param {*} dbConnection The connection instance of MongoDB.
	 * @param {boolean} local If the connection is to local host.
	 * @param {string} username The username for the remote database.
	 */
	HandleConnection(dbConnection, local, username)
	{
		if (local)
		{
			dbConnection.once('open', () => {
				carrier('Database', 'Using this machine as the host.');
			});
			dbConnection.on('error', error => {
				outerr(`[Local Database > mongoDB] A connection error has occured: \n"${error.message}"`);
			});
		}
		else
		{
			dbConnection.once('open', () => {
				if (!failedOnline) carrier('status: > Remote Database', `Status 200: Connected as "${username}"`);
			});
			dbConnection.on('error', error => {
				outerr(`[Remote Database > mongoDB] A connection error has occured: \n"${error.message}"`);
				carrier('status: 500', 'This will use localhost instead.');

				if (failedOnline) return this.onRefusedConnection(true);
				failedOnline = true;

				if (local && failedLocal) return;
				if (local) warn('[Local Database] Failed to connect to localhost. Incoming connection errors will be ignored.');
				failedLocal = true;

				return this.Init();
			});
		}
		dbConnection.on('disconnected', () => {
			carrier('Database', `Disconnected from ${local ? 'local database' : 'remote database'}.`);
		});
	}
};