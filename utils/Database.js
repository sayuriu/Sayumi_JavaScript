const db = require('mongoose');
const Logger = require('./Logger');
const log = new Logger;

/** This module is dedicated to use on Mongoose only.
 * Provides basic actions and connect to MongoDB.
*/
module.exports = class Database {

	/** Initiates the connection.
	 * @param {boolean} local If this project decides to use local database (stored on this machine).
	 * @param {string} username The username for the remote database.
	 * @param {string} password The password associated with the username.
	 * See {@link https://www.mongodb.com/ [MongoDB]}
	 */
	init(local, username, password)
	{
		if (local)
		{
			db.connect(`mongodb://localhost/sayumi`, {
				useNewUrlParser: true,
				useUnifiedTopology: true,
			});
			const Connection = db.connection;
			this.handleConnection(Connection, false);
		}
		else
		{
			db.connect(`mongodb+srv://${username}:${password}@main-ftdmd.azure.mongodb.net/sayumi`, {
				useNewUrlParser: true,
				useUnifiedTopology: true,
				family: 0,
			});
			const Connection = db.connection;
			this.handleConnection(Connection, true, username);
		}
	}

	/** Handles basic events of a connection.
	 * @param {*} connection The connection instance of MongoDB.
	 * @param {boolean} online If the connection is to local host, then use `false`.
	 * @param {string} username The username for the remote database.
	 */
	handleConnection(connection, online, username)
	{
		if (online)
		{
			connection.once('open', () => {
				log.carrier('status: > Remote Database', `Status 200: Connected as "${username}"`);
			});
			connection.on('error', error => {
				log.error(`[Remote Database > mongoDB] A connection error has occured. \n${error.message}`);
			});
		}
		else
		{
			connection.once('open', () => {
				console.log('Connected! We are now using local host!');
			});
			connection.on('error', error => {
				log.error(`[Local Database > mongoDB] A connection error has occured. \n${error.message}`);
			});
		}
		connection.on('disconnected', () => {
			log.carrier('status: 0', `Disconnected from ${online ? 'remote database' : 'local database'}.`);
		});
	}
};