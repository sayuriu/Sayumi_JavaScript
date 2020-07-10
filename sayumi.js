// Init
const FileSystem = require('fs');
const path = require('path');

const Discord = require('discord.js');
const Winston = require('winston');
const Database = require('mongoose');
const GlobalSettings = require('./DefaultGlobalSettings');
const { connect } = require('http2');

require('dotenv').config();
const { TOKEN, master, databaseUsername, databasePassword } = process.env;

// Paths
const URIString = `mongodb+srv://${databaseUsername}:${databasePassword}@main-ftdmd.azure.mongodb.net`;

const client = new Discord.Client();

const cooldown = new Discord.Collection();
const MentionCooldown = new Discord.Collection();
client.commandsList = new Discord.Collection();
client.aliasesList = new Discord.Collection();
client.cagetories = new Discord.Collection();

// Date-time system
const now = Date.now();
const days = Math.floor(now / 86400000);
const hours = (Math.floor(now / 3600000) % 24) + 7;
const minutes = Math.floor(now / 60000) % 60;
const seconds = Math.floor(now / 1000) % 60;

const hrs = `${hours   < 10 ? '0' : ''}` + hours;
const min = `${minutes < 10 ? '0' : ''}` + minutes;
const sec = `${seconds < 10 ? '0' : ''}` + seconds;

// Logger init
const logger = Winston.createLogger({
    transports: [
      new Winston.transports.Console(),
      new Winston.transports.File({ filename: './log.txt', json: false }),
    ],
    format: Winston.format.printf(
      log => `[${log.level.toUpperCase()}] - ${log.message} (${days} - ${hrs}:${min}:${sec}) <GMT +7>`),
  });

client.on('ready', () => {
    logger.log('info', 'Status 200');
  });

  client.on('debug', m => logger.log('debug', m));
  client.on('warn', m => logger.log('warn', m));
  client.on('error', e => logger.log('error', e));

  process.on('uncaughtException', error => {
    logger.log('error', 'Uncaught exception received.\n', error);
    console.error(error);
  });
  process.on('unhandledRejection', error => {
    console.error('Uncaught Promise Rejection:\n', error.name + ': ' + error.message + '\n- Details:\t');
    console.error(error);
    logger.error(error);
  });

// Database init
console.log('Connecting to database...');
Database.connect(`mongodb+srv://${databaseUsername}:${databasePassword}@main-ftdmd.azure.mongodb.net/sayumi/test/`, {
    useUnifiedTopology: true,
});

const Connection = Database.connection;
Connection.on('error', e => {
    console.error.bind(console, 'Connection ERR:');
    logger.log('error', e);
});

// Status message and misc.
client.once('ready', () => {
    const options = [
      'Log standby...',
      'Ready!',
      'On standby.\nAn activity will be set if you start a command.',
      'The log\'s ready.',
      'Connection established.',
    ];
    const ready = options[Math.floor(Math.random() * options.length)];
    console.log(ready);
    setInterval(() => {
      const statuses = [
        'raw event data',
        'what is her prefix',
        'how to become a reliable maid',
        'Sayuri\'s diary',
        `${client.users.size} users`,
		'debug console',
        'terminal output',
      ];
    const Status = statuses[Math.floor(Math.random() * statuses.length)];
    client.user.setActivity(Status, { type: 'WATCHING' }).then(presence => {
        console.log(
            '<Activity>',
            `Activity set to '${presence.game ? presence.game.name : 'none'}'.`,
        );
      });
    }, 300000);
  });

client.once('reconnecting', () => {
    console.log('Reconnecting...');
});
client.once('disconnect', () => {
    console.log('Connection lost.');
});

// Load executables from command directory
const Root = './';
const CommandsLibrary = 'executables';
const DatabaseLibrary = 'databaseModels';
let FileCount = 0;
let ExecutableFileCount = 0;
let UnexecutableFileCount = 0;
let EmptyFileCount = 0;

function getFileSize(filename) {
    const stats = FileSystem.statSync(filename);
    const fileSizeInBytes = stats["size"];
    return fileSizeInBytes;
}

function DirectoryLoad(dir) {

    FileSystem.readdirSync(dir).forEach(file => {
        const Path = Root + path.join(dir, file);
        if (file === 'settings.js') return;
        if (FileSystem.lstatSync(Path).isDirectory()) {
            DirectoryLoad(Path);
        }
        else if (file.endsWith('.js')) {
            FileCount++;
            const Command = require(Path);
            const FileSize = getFileSize(Path);
            if (FileSize <= 0) {
                EmptyFileCount++;
            }
            if (Command.status === false) {
                UnexecutableFileCount++;
            }
            else ExecutableFileCount++;
            client.commandsList.set(Command.name, Command);
            client.aliasesList.set(Command.aliases, Command.name);
        }
    });
    if (FileCount <= 0) {
        console.log(['[INFO] The directory is currently empty!']);
        } else {
        console.log(`[INFO] Successfully loaded ${FileCount} file${FileCount > 1 ? 's' : ''}`);
        if (UnexecutableFileCount > 0) {
            console.log(`with ${UnexecutableFileCount} file${UnexecutableFileCount > 1 ? 's' : ''} disabled`);
        }
        if (EmptyFileCount > 0) {
            console.log(`with ${EmptyFileCount} file${EmptyFileCount > 1 ? 's' : ''} empty`);
        }
    }
    resetFileCounter();
}

function resetFileCounter() {
    FileCount = 0;
    ExecutableFileCount = 0;
    UnexecutableFileCount = 0;
    EmptyFileCount = 0;
    return;
}

console.log(['[INFO] Loading executables...']);
DirectoryLoad(CommandsLibrary);
console.log(['[INFO] Loading database models...']);
DirectoryLoad(DatabaseLibrary);


// Message events
client.on('message', async message => {
    const Guild = JSON.parse('./GuildList.json', 'utf8');
    const Channel = JSON.parse('./ChannelStatus.json', 'utf8');

    let prefix = GlobalSettings.defaultPrefix;
    let FalseCMDReply = GlobalSettings.defaultFalseCMDReply;
    let ReplyStatus = GlobalSettings.defaultReplyStatus;

    if (message.guild) {
        if (!Guild[message.guild.id]) {
            Guild[message.guild.id] = {
                prefix: GlobalSettings.defaultPrefix,
                welcomeChannel: false,
                greetingMessage: '',

            };
        }
        prefix = Guild[message.guild.id].prefix;
    }

    if (message.channel && message.channel.type !== 'dm' && message.channel.type !== 'voice') {
        if (!Channel[message.channel.id]) {
            Channel[message.channel.id] = {
                FalseCMDReply: GlobalSettings.defaultFalseCMDReply,
                AllowReply: GlobalSettings.defaultReplyStatus,
            };
        }
        FalseCMDReply = Channel[message.channel.id].FalseCMDReply;
        ReplyStatus = Channel[message.channel.id].AllowReply;
    }

    if (message.guild) {
        if (ReplyStatus === false) {
            if (!message.member.hasPermission('ADMINISTRATOR')) return;
            else;
        }
        if (!message.client.permissions.has('SEND_MESSAGES') || !message.client.permissions.has('READ_MESSAGE_HISTORY')) return;
    }
    const args = message.content.slice(prefix.length).split(/ +/);
    const CommandName = args.shift().toLowerCase();
    const command = client.commandsList.get(CommandName) ||
                    client.commandsList.find(cmd => cmd.aliases && cmd.aliases.includes(CommandName));

    const contents = message.content.toLowerCase();

    // if (content.includes(prefix, 0) && content.includes(CommandName, 1)) {}

    // Mention respond (general)
    let MentionedMassage = false;
    if (!message.content.startsWith(prefix)) {
        if (message.author.bot) return;
        if (contents.startsWith(`<@${client.user.id}>`) && !message.author.bot) {
            if (message.author.id === master) {
                const reply = ['', '', '', 'Not now.', 'No.'];
                const respond = reply[Math.floor(Math.random() * reply.length)];
                message.channel.send(respond);
                MentionedMassage = true;
            }
            else {
                const reply = [
                `My prefix is \`${prefix}\``,
                `Type \`${prefix}help\` to see command index.`,
                'Am I a human?',
                ];
                const respond = reply[Math.floor(Math.random() * reply.length)];
                if (MentionedMassage === false) return message.channel.send(respond);
                if (MentionedMassage === true) return;
                MentionedMassage = true;
                logger.log(message.author.tag + ' tagged me.\n Contents: ' + `'${message.content}'`);
            }
        }

        setTimeout(7000).then(MentionedMassage = false);

        if (!MentionCooldown.has('mention')) {
        MentionCooldown.set('mention', new Discord.Collection());
        }
        const MentionTimestamp = MentionCooldown.get('mention');
        const PausedTime = 5000;

        if (MentionTimestamp.has(message.author.id)) {
            const MentionExpirationTime = timestamps.get(message.author.id) + PausedTime;

            if (now < MentionExpirationTime && message.author.id !== process.env.master) {
              const timeLeft = (MentionExpirationTime - now) / 1000;
                if (ReplyStatus === true) return message.channel.send(
                `Wait ${timeLeft.toFixed(0)} more second${
                  timeLeft > 1 ? 's' : ''
                }...`,
                ).then(message.delete(3000));
            } else;
          }
        MentionTimestamp.set(message.author.id, now);
        setTimeout(() => MentionTimestamp.delete(message.author.id), PausedTime);

    }

    console.log('<Terminal>', 'A command has been executed.');

    if (!command) {
        const typo = message.content.slice(prefix.length);
        const NotACmd = [
            'This is not a vaild command for me.',
            `Perhaps a typo, ${message.author}?\n\`'${typo}'\``,
            'I can\'t issue this.',
            `What is *${typo}*?`,
            `If that is an unadded feature, consider typing \`${prefix}feedback ${typo}\` if you want this feature/command added to my collection.`,
        ];
        const respond1 = NotACmd[Math.floor(Math.random() * NotACmd.length)];

        console.log(
            '<Terminal>',
            `Unknown command '${CommandName}'. command execution has been cancelled.`,
        );
        if (FalseCMDReply === true && ReplyStatus === true) return message.channel.send(respond1);
    }

    console.log('command name: ' + CommandName);
    const cmdArgs = message.content.slice(prefix.length + CommandName.length + 2).split(/ +/);
    if (cmdArgs === '') {
        if (command.description === '') {
            console.log(
                'Command to issue: ' +
                `/${CommandName}: ` +
                '<no description> ' +
                '(empty_string)',
            );
        }
        if (!command.args) {
        if (command.description) {
            console.log(
            'Command to issue: ' +
                `/${CommandName}: ` +
                command.description,
            );
        } else {
            console.log(
                'Command to issue: ' +
                `/${CommandName}: ` +
                '<no description> ',
            );
            }
        } else {
        console.log(
            'Command to issue: ' +
            `/${CommandName}: ` +
            command.description +
            '(empty_string)',
        );
        }
    } else {
        console.log('command to issue: ' + `/${CommandName}: ` + `'${cmdArgs}'`);
    }
    // const BlankCmd = [
    //     'Hmmmmmm...'
    // ];
    // const respond2 = BlankCmd[Math.floor(Math.random() * BlankCmd.length)];
    //     if (message.content === `${prefix}`) {
    //         if (ReplyStatus === true) return message.channel.send(respond2).then(m => m.delete(4000));
    //         else return;
    //     }

    // Command cooldowns
    if (!cooldown.has(command.name)) {
        cooldown.set(command.name, new Discord.Collection());
        }

        const timestamps = cooldown.get(command.name);
        const cooldownAmount = (command.cooldown || 3) * 1000;

        if (timestamps.has(message.author.id)) {
            const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

            if (now < expirationTime && message.author.id !== master) {
                const timeLeft = (expirationTime - now) / 1000;
                return message.reply(
                    `please wait ${timeLeft.toFixed(0)} more second${
                    timeLeft > 1 ? 's' : ''
                    } before reusing the '${command.name}' command.`,
                );
            }
        }

    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

    // Responses when executing guild commands inside DMs
    if (command.guildOnly && message.channel.type !== 'text') {
        console.log(
          '<Terminal>',
          `User ${message.author} has sent a guild command in direct message.`,
        );
        const NoDM = [
          'Unfortunately, this command cannot be executed inside DMs.',
          'Sorry, but i can\'t do this inside a direct-message chat.',
          'Make sure that you typed this command inside a server.',
        ];
        const respond = NoDM[Math.floor(Math.random() * NoDM.length)];
        return message.reply(respond);
    }

    // Master-only commands
    if (command.ownerOnly && message.author.id !== master) {
        if (ReplyStatus === true) return message.channel.send(`Sorry ${message.author}, but this command can be issued by my master only.`);
      }

    // Empty args responses
    if (command.args && !args.length) {
        console.log('<Args>', 'Starting arguments detection...'),
        console.log(
            '<Args#return>',
            `User ${message.author} didn't give any arguments. command cancelled.`,
        );
        let string = command.prompt;
        if (string === false) {
           message.channel.send('Terminal standing by.').then(m => m.delete(4000));
           return;
        }
        if (string === undefined || string === null || string === '') {
            const NoArgs = [
            'There is no arguments.',
            `Hey ${message.author}, I need an argument to work with.`,
            `You didn't provide any arguments, ${message.author}!`,
            'Hmmm...I don\'t see any arguments here.',
            ];
            string = NoArgs[Math.floor(Math.random() * NoArgs.length)];
            if (command.usage) {
                string += `\nUsage: \`${prefix}${command.name} ${command.usage}\`.`;
            }
            if (ReplyStatus === true) return message.channel.send(string).then(m => m.delete(8000));
        }
        if (command.usage) {
            string += `\nUsage: \`${prefix}${command.name} ${command.usage}\`.`;
        }
        if (ReplyStatus === true) return message.reply(string).then(m => m.delete(6000));
      }

    // Execute commands and error responses
    try {
        console.log('[DEBUG] Running command: ' + command.name);
        command.issue(message, args, client);
      } catch (error) {
        console.error(error);
        logger.log('error', error);
        console.log('<Error>', 'Found ' + error);
        const err = [
          'The command you are trying to issue is unavailable or being not issued due to some errors. Please try again later.',
          'Oops, looks like I have encounter an error. Error is being reported, I\'m trying to fix this as soon as possible.',
        ];
        if (message.channel.type !== 'dm' && message.channel.type !== 'voice') {
          const channel = client.channels.get('630334027081056287');
          const embed = new Discord.RichEmbed()
            .setColor('#ff0000')
            .setTitle('An error has occured.')
            .setDescription(`*At ${message.channel} of server '${message.guild.name}'*\n*Issued by* - ${message.author.tag}:\n'${message.content}'`)
            .addField('Error status ------------------------------------------', `\`${error}\``)
            .setTimestamp();
            channel.send(embed);
        } else {
          const channel = client.channels.get('630334027081056287');
          const embed = new Discord.RichEmbed()
            .setColor('#ff0000')
            .setTitle('An error has occured.')
            .setDescription(`*Issued by* ${message.author}`)
            .addField('Error status ------------------------------------------', `\`${error}\``)
            .setTimestamp();
            channel.send(embed);
        }
        const respondErr = err[Math.floor(Math.random() * err.length)];
        if (message.channel.type === 'dm') return message.channel.send(respondErr);
        else if (message.channel.type !== 'dm') {
            message.channel.send(respondErr).then(message.delete(4500));
        }
        return;
      }

});

// Guild events
client.on('guildCreate', async guild => {
    Database.connect(URIString + '/sayumi/GuildList', {
        useNewURLParser: true,
        useUnifiedTopology: true,
    });
    const Guild = require('./databaseModels/guild');

    const NewGuild = new Guild({
        ItemID: Database.Types.ObjectId(),
        guildName:      guild.name,
        guildID:        guild.id,
        guildOwnerTag:  guild.owner.tag,
        guildOwnerID:   guild.owner.id,
        memberCount:    guild.member.size,
        prefix:         GlobalSettings.defaultPrefix,
        welcomeChannel: GlobalSettings.welcomeChannel,
        welcomeMessage: GlobalSettings.welcomeMessage,
        adminRoles:     GlobalSettings.AdminRoles,
        modRoles:       GlobalSettings.moderatorRoles,
        //
        modStatus:      GlobalSettings.moderatorStatus,
        adminStatus:    GlobalSettings.Administrator,
    });

    NewGuild.save().then(res => console.log(res)).catch(console.error);
    logger.log('info', `I was added to ${guild.name}!`);
});

client.on('guildDelete', async guild => {
    Database.connect(URIString + '/sayumi/GuildList', {
        useNewURLParser: true,
        useUnifiedTopology: true,
    });


});

// Login.
client.login(TOKEN).catch(console.error);