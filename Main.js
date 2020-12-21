// #region AssetRequire
const { Client } = require('discord.js');
const modules = require('./MainModules');
require('dotenv').config();
// #endregion

// #region PreDefine
const Sayuri = Object.assign(new Client(), modules);
// #endregion

// #region Actions
new Sayuri.Database(Sayuri).Init();
new Sayuri.Client(Object.assign(modules, { client: Sayuri }), process.env.TOKEN).Init();
// #endregion