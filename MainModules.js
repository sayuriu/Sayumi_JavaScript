const { Collection } = require('discord.js');

const Client = require("./utils/Client");
const EmbedConstructor = require("./utils/Embeds");
const Database = require('./utils/Database');
const GuildDatabase = require('./utils/database/methods/guildActions');

const express = require('express');
const GlobalFunctions = require('./utils/Methods');
const Logger = require('./utils/Logger');

const Props = require('./utils/json/Props.json');

require('dotenv').config();

module.exports = {

	ROOT_DIR: __dirname,
	/** The host for Discord client.
	 * @param {object} data Must contain the client object and token.
	*/
	Client,
	/**
	 * Provides basic actions and connections to MongoDB.
	 * @param {object} data [Object] Contains `local (boolean)`, `username`, and `password`.
	*/
	Database,
	GuildDatabase,

	CommandList: new Collection(),
	CommandAliases: new Collection(),
	CommandCategories: new Collection(),

	Channels: new Collection(),
	Messages: new Collection(),
	Cooldowns: new Collection(),
	AFKUsers: new Collection(),
	Timestamps: new Collection(),

	EvaluatingSessions: new Collection(),

	Embeds:  EmbedConstructor,
	Methods: GlobalFunctions,
	Log: Logger,

	// Database side
	local: true,
	dbUsername: process.env.databaseUsername,
	dbPassword: process.env.databasePassword,

	master: process.env.master,

	// APIs
	APIs:
	{
		nasa: process.env.nasaAPI,
		youtube: process.env.youtubeAPI,
		imgur:
		{
			clientID: process.env.imgurClientID,
			clientSecret: process.env.imgurClientSecret,
		},
	},

	App: {
		Express: express(),
		link: process.env.ProjLink,
	},
	Props: Props,
};