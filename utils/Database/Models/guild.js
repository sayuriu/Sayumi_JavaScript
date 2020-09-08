const Database = require("mongoose");
const DefaultSettings = require("../../DefaultGlobalSettings.json");

const Guilds = new Database.Schema({
    _id: Database.Schema.Types.ObjectId,
    guildID: String,
    guildName: String,
    prefix: {
        type: String,
        default: DefaultSettings.prefix,
    },
    welcomeChannel: {
        type: String,
        default: null,
    },
    defaultWelcomeMsg: {
        type: String,
        default: null,
    },

    AllowedReplyOn: {
        type: Array,
    },
    FalseCMDReply: {
        type: Array,
    },

    LogHoldLimit: {
        type: Number,
        default: 1,
    },
    MessageLogChannel: {
        type: String,
    },
    MessageLogState: {
        type: Boolean,
        default: false,
    },
    MessageLog: {
        type: Map,
        default: new Map(),
    },
    AllowPartialNSFW: {
        type: Boolean,
        default: false,
    },
    AFKUsers: {
        type: Boolean,
        default: false,
    }
}, {
    collection: 'GuildList',
});

module.exports = Database.model('GuildList', Guilds);