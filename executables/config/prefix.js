const FileSystem = require("fs");


module.exports = {
    name: 'prefix',
    cooldown: 30,
    guildOnly: true,
    async issue(message, args) {
        if (!message.member.hasPermission('MANAGE_SERVER')) return;
        const currentPrefix = JSON.parse('../../GuildList.json', 'utf8')[message.guild.id].prefix;
        if (!args[0] || args[0] === 'help') {
            let string = `Current prefix in this server is \`${currentPrefix}\`!`;
            if (message.member.hasPermission('MANAGE_SERVER')) {
                string += `\n You can change it by entering \`${currentPrefix}prefix *<Prefix>*\``;
                return message.channel.send(string);
            }
            else {
                const _0 = ["", "", "\nYou can call the manager to change hwo you call me."];
                const _1 = _0[Math.floor(Math.random() * _0.length)];
                string += _1;
                return message.channel.send(string);
            }
        }
        if (message.member.hasPermission('MANAGE_SERVER')) {
            const Prefix = JSON.parse(FileSystem.readFileSync('../../GuildList.json', 'utf8'));
            Prefix[message.guild.id] = {
                prefix: args[0],
            };

            FileSystem.writeFile('../../GuildList.json', JSON.stringify(Prefix), err => {
                console.error(err);
            });
            message.channel.send(`The prefix successfully changed to ${args[0]}`);
        }
    },
};