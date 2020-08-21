// #region AssetRequire
const discord = require('discord.js');
const Client = require("./utils/Client");
const Functions = require('./utils/Functions');
const Loader = require('./utils/Loader');

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
const loader = new Loader;

// #endregion
client.login(Sayuri, TOKEN);
client.eventListener(Sayuri);

// Sayuri.on('message', message => {
//     Sayuri.CommandList.get('upt')
// });
module.exports = {
    CommanndList: Sayuri.CommandList,
    CommandAliases: Sayuri.CommandAliases,
    CommandCagetories: Sayuri.CommandCagetories,
};