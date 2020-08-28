// #region AssetRequire
const discord = require('discord.js');
const Client = require("./utils/Client");
const Database = require('./utils/Database');

require('dotenv').config();
// #endregion

// #region PreDefine
const { TOKEN, databaseUsername, databasePassword } = process.env;
const Sayuri = new discord.Client();
Sayuri.CommandList = new discord.Collection();
Sayuri.CommandAliases = new discord.Collection();
Sayuri.CommandCagetories = new discord.Collection();

const client = new Client;
const database = new Database;
// #endregion

// #region Actions
database.init(false, databaseUsername, databasePassword);
client.CommandInit(Sayuri);
client.eventListener(Sayuri);
client.login(Sayuri, TOKEN);
client.handleProcessErrors();

// #endregion