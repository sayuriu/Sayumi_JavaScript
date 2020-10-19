// #region AssetRequire
const { Client } = require('discord.js');
const modules = require('./MainModules');
// #endregion

// #region PreDefine
const Sayuri = Object.assign(new Client(), modules);
// #endregion

// #region Actions
new Sayuri.Database(Sayuri).Init();
new Sayuri.Client(Object.assign(Sayuri, { client: Sayuri })).Init();
// #endregion

// TODO: Add static methods.