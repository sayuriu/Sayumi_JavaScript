//Init
const FileSystem = require("fs");
const Path = require("path");

const Discord = require("discord.js");
const Winston = require("winston");


require("dotenv").config;
const {TOKEN, master} = process.env;

const client = new Discord.Client();
const cooldown = new Discord.Collection();
client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();
client.cagetories = new Discord.Collection();

//Date-time system
const now = Date.now();
const days = Math.floor(now / 86400000);
const hours = (Math.floor(now / 3600000) % 24) + 7;
const minutes = Math.floor(now / 60000) % 60;
const seconds = Math.floor(now / 1000) % 60;

let hrs = "";
    if (hours < 10) {
        hrs = `0${hours}`;
    } else {
        hrs = hours;
    }
let min = "";
    if (minutes < 10) {
        min = `0${minutes}`;
    } else {
        min = minutes;
    }
let sec = "";
    if (seconds < 10) {
        sec = `0${seconds}`;
    } else {
        sec = seconds;
    }

//Logger init 
const logger = Winston.createLogger({
    transports: [
      new Winston.transports.Console(),
      new Winston.transports.File({ filename: "./log.txt", json: false }),
    ],
    format: winston.format.printf(
      log => `[${log.level.toUpperCase()}] - ${log.message} (${days} - ${hrs}:${min}:${sec}) <GMT +7>`),
  });
  client.on("ready", () => {
    logger.log("info", "Status 200");
  });
  client.on("debug", m => logger.log("debug", m));
  client.on("warn", m => logger.log("warn", m));
  client.on("error", e => logger.log("error", e));
  
  process.on("uncaughtException", error => {
    logger.log("error", "Uncaught exception received.\n", error);
    console.error(error);
  });
  process.on("unhandledRejection", error => { 
    console.error("Uncaught Promise Rejection:\n", error.name + ": " + error.message + `\n- Details:\t`);
    console.error(error);
  });

//Local database init
let database = [];
fs.readdirSync(Root).forEach(file => {
    if (file !== "db.txt") return;
    const dbFile = "db.txt";
    if (!dbFile) {
    fs.writeFile("db.txt", (err) => {
        console.log(err);
        return;
    });
    } else if (dbFile) {
    database = fs.readFile(dbFile);
    return database;
    }
});

//Status message and misc.
client.once("ready", () => {
    const options = [
      "Log standby...",
      "Ready!",
      "On standby.\nAn activity will be set if you start a command.",
      "The log's ready.",
      "Connection established.",
    ];
    const ready = options[Math.floor(Math.random() * options.length)]; 
    console.log(ready);
    client.users.get(process.env.ownerID).send('Terminal online.');
    setInterval(() => {
      const statuses = [
        "raw event data", 
        "what is her prefix", 
        "how to become a reliable maid", 
        "Sayuri's diary", 
        `${client.users.size} users`, 
        "debug console",
        "terminal output",
      ];
    const Status = statuses[Math.floor(Math.random() * statuses.length)];
    client.user.setActivity(Status, { type: "WATCHING" }).then(presence => {
        console.log(
            "<Activity>",
            `Activity set to "${presence.game ? presence.game.name : "none"}".`
        );
      });
    }, 300000);
  });
  
client.once("reconnecting", () => {
    console.log("Reconnecting...");
});
client.once("disconnect", () => {
    console.log("Connection lost.");
});

// Load executables from command directory
const Root = "./";
const Commands = Root + "executables";
let FileCount = 0;
let ExecutableFileCount = 0;
let UnexecutableFileCount = 0;
let EmptyCommandFileCount = 0;

const CommandLoad = (dir) => {

    FileSystem.readdirSync(dir).forEach(file => {
        const Path = Root + Path.join(dir, file)
        if (file === "settings.js") return;
        if (FileSystem.lstatSync(Path).isDirectory) {
            CommandLoad(Path);
        }
        else if (file.endsWith(".js")) {
            FileCount++;
            const Command = require(dir);
            if (!Command.Issue || !Command.Issue === {}) {
                EmptyCommandFileCount++;
            }
            if (!Command.status === false) {
                UnexecutableFileCount++
            } 
            else ExecutableFileCount++;
            client.commands.set(Command.name, Command);
            client.aliases.set(Command.aliases, Command.name);
        }
   });
};

CommandLoad(Commands);

console.log(`[INFO] Successfully loaded ${FileCount} commands`);
if (UnexecutableFileCount > 0) { 
    console.log(`with ${UnexecutableFileCount} files disabled`);
}
if (EmptyCommandFileCount > 0) {
    console.log(`with ${EmptyCommandFileCount} files empty`);
}

client.on("message", async message => {
    let Guild = JSON.parse("./GuildList.json", "utf8");
    if (!Guild[message.guild.id]) {
        Guild[message.guild.id] = {
            prefix: process.env.defaultPrefix,
        }
    }
    let prefix = Guild[message.guild.id].prefix;

    let Channel = JSON.parse("./ChannelStatus.json", "utf8");
    if (!Channel[message.channel.id]) {
        Channel[message.channel.id] = {
            FalseCMDReply: process.env.defaultFalseCMDReply,
            AllowReply: process.env.defaultReplyStatus
        }
    }
    
    let FalseCMDReply = Channel[message.channel.id].FalseCMDReply;
    let ReplyStatus = Channel[message.channel.id].AllowReply;
    
    if (!message.client.permissions.has("SEND_MESSAGES") || !message.client.permissions.has("VIEW_CHANNELS")) return;

    const args = message.content.slice(prefix.length).split(/ +/);
});
client.login(TOKEN).catch(console.error);