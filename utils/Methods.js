module.exports = {
    Common: {
        ArrShiftToLast: require('./functions/common/array-shift-to-last'),
        ArrShuffle: require('./functions/common/array-shuffler'),
        DelayTask: require('./functions/common/delay-task'),
        DuplicationCheck: require('./functions/common/duplication-check'),
        EscapeRegExp: require('./functions/common/escape-reg-exp.js'),
        Greetings: require('./functions/common/greetings'),
        HSLtoRGB: require('./functions/common/hsl-to-rgb'),
        JoinArrayString: require('./functions/common/join-array-to-str'),
        ParseErrors: require('./functions/common/parse-errors'),
        RandomHex8: require('./functions/common/ranhex8'),
        Randomize: require('./functions/common/randomize'),
        StringSearch: require('./functions/common/string-search'),
        StringLimiter: require('./functions/common/string-limiter'),
    },
    Time: {
        ConvertDate: require('./functions/time-manupilation/convert-date'),
        DateTime: require('./functions/time-manupilation/date-time'),
        DaysAgo: require('./functions/time-manupilation/days-ago'),
        TimestampToTime: require('./functions/time-manupilation/timestamp-to-time'),
    },
    DiscordClient: {
        ChannelCheck: require('./functions/discord-client/channel-check'),
        PermissionsCheck: require('./functions/discord-client/perms-check'),
        SelfMessageDelete: require('./functions/discord-client/self-msg-delete'),
    },
    Data: {
        ConvertBytes: require('./functions/dir-set/convert-bytes'),
    },
    DirSet: {
        GetTotalSize: require('./functions/dir-set/get-total-size'),
    },
};