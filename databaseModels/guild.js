const Database = require("mongoose");
const DefaultSettings = require("../DefaultGlobalSettings");

const Guild = Database.Schema({
    ItemID: Database.Schema.Types.ObjectId,
    guildID: String,
    guildName: String,
    guildOwnerTag: String,
    guildOwnerID: String,
    memberCount: Number,
    prefix: {
        type: String,
        def: DefaultSettings.defaultPrefix,
    },
    welcomeChannel: {
        type: String,
        def: DefaultSettings.defaultWelcomeChannel,
    },
    welcomeMessage: {
        type: String,
        def: DefaultSettings.defaultWelcomeMsg,
    },
    adminRoles: {
        type: Array,
        def: DefaultSettings.AdminRoles,
    },
    modRoles: {
        type: Array,
        def: DefaultSettings.moderatorRoles,
    },

    // Some additional settings (You might not need it.)

    modStatus:{ //Whatever if she has mod
        type: Boolean,
        def: DefaultSettings.moderatorStatus,
    },
    adminStatus:{ //Whatever if she is admin
        type: Boolean,
        def: DefaultSettings.Administrator,
    }
});

module.exports = Database.model("GuildList", Guild);