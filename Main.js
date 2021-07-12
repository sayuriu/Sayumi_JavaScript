// #region AssetRequire
const { Client } = require('discord.js');
const modules = require('./MainModules');
require('dotenv').config();
// #endregion

// #region PreDefine
const Sayuri = Object.assign(new Client(), modules);
// #endregion

// #region Actions
try {
	new Sayuri.Database(Sayuri).Init();
	new Sayuri.Client(Sayuri, process.env.TOKEN).Init();
} catch (e) {
	Sayuri.Log.error(`${e.message}\n${e.stack}`);
	if (e.FATAL) process.exit(1);
}
// #endregion

