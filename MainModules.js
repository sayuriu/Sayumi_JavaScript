const { Collection } = require('discord.js');

const EmbedConstructor = require("./utils/Embeds");
const Database = require('./utils/Database');
const GuildDatabase = require('./utils/database/methods/guildActions');

require('dotenv').config();

module.exports = {

	ROOT_DIR: __dirname,

	/** The host for Discord client.
	 * @param {object} data Must contain the client object and token.
	*/
	Client: require("./utils/Client"),
	/**
	 * Provides basic actions and connections to MongoDB.
	 * @param {object} data [Object] Contains `local (boolean)`, `username`, and `password`.
	 * @property {object} Guild Guild database utility class.
	*/
	Database: Object.assign(Database, { Guild: GuildDatabase }),

	CommandList: new Collection(),
	CommandAliases: new Collection(),
	CommandCategories: new Collection(),

	CachedGuildSettings: new Collection(),
	// @flag:deprecated - Merge with guild settings since this is not affected by DMs
	Channels: new Collection(),
	Messages: new Collection(),
	Cooldowns: new Collection(),
	AFKUsers: new Collection(),
	Timestamps: new Collection(),

	EvaluatingSessions: new Collection(),

	Embeds:  EmbedConstructor,
	Methods: require('./utils/Methods'),
	Log: require('./utils/Logger'),

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
		Express: require('express')(),
		link: process.env.ProjLink,
	},
	Props: require('./utils/json/Props.json'),
};