// #region AssetRequire
const discord = require('discord.js');
const Client = require("./utils/Client");
const Functions = require('./utils/Functions');

require('dotenv').config();
// #endregion

// #region PreDefine
const { TOKEN } = process.env;
const Sayuri = new discord.Client();
Sayuri.CommandList = new discord.Collection();
Sayuri.CommandAliases = new discord.Collection();
Sayuri.CommandCagetories = new discord.Collection();

const functions = new Functions;
const client = new Client;

// #endregion
client.login(Sayuri, TOKEN);
client.CommandInit(Sayuri);
client.eventListener(Sayuri);
functions.Test();

module.exports = {
    CommanndList: Sayuri.CommandList,
    CommandAliases: Sayuri.CommandAliases,
    CommandCagetories: Sayuri.CommandCagetories,
};