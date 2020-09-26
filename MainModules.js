const { Collection } = require('discord.js');
const express = require('express');
const Client = require("./utils/Client");
const EmbedConstructor = require("./utils/Embeds");
const Logger = require('./utils/Logger');
const Database = require('./utils/Database');
const GlobalFunctions = require('./utils/Methods');
const GuildDatabase = require('./utils/Database/Methods/guildActions');

const Props = require('./utils/json/Props.json');

require('dotenv').config();

module.exports = {
	/** The host for Discord client.
	 * @param {object} data Must contain the client object and token.
	*/
	Client: Client,
	/**
	 * Provides basic actions and connections to MongoDB.
	 * @param {object} data [Object] Contains `local (boolean)`, `username`, and `password`.
	*/
	Database: Database,

	CommandList: new Collection(),
	CommandAliases: new Collection(),
	CommandCategories: new Collection(),

	Channels: new Collection(),
	Messages: new Collection(),
	Cooldowns: new Collection(),
	AFKUsers: new Collection(),
	Timestamps: new Collection(),

	Embeds: new EmbedConstructor,
	Methods: new GlobalFunctions,
	Log: new Logger,
	GuildDatabase: new GuildDatabase,

	// Database side
	local: false,
	dbUsername: process.env.databaseUsername,
	dbPassword: process.env.databasePassword,

	token: process.env.TOKEN,
	master: process.env.master,

	// APIs
	APIs:
	{
		nasa: process.env.nasaAPI,
		youtube: process.env.youtubeAPI,
	},

	App: {
		Express: express(),
		link: process.env.ProjLink,
	},
	Props: Props,
};