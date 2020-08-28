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
        default: DefaultSettings.WelcomeChannel,
    },
    defaultWelcomeMsg: {
        type: String,
        default: DefaultSettings.WelcomeMsg,
    },
    AdminRoles: {
        type: Array,
        default: DefaultSettings.AdminRoles,
    },
    moderatorRoles: {
        type: Array,
        default: DefaultSettings.moderatorRoles,
    },

    // Utils and misc.
    AllowedReplyOn: {
        type: Array,
    },
    FalseCMDReply: {
        type: Boolean,
        default: DefaultSettings.FalseCMDReply,
    },
});

module.exports = Database.model("GuildList", Guilds);