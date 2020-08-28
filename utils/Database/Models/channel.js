const Database = require("mongoose");
const DefaultSettings = require("../DefaultGlobalSettings");

const ChannelStatus = new Database.Schema({
    ItemID: Database.Schema.Types.ObjectId,
    channelID: String,
    channelName: String,
    replyStatus: {
        type: String,
        default: DefaultSettings.defaultReplyStatus,
    },
    FalseCMDReply: {
        type: String,
        default: DefaultSettings.defaultFalseCMDReply,
    },
});

module.exports = Database.model("ChannelStatus", ChannelStatus);