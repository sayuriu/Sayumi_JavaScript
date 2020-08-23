module.exports = class Functions  {

    // Some methods are dedicated to a specific command or class, but here you go.

    channelCheck(channel)
    {
        if (channel.type === 'dm') return 'In DM';
        else
        {
            const ch = {
                name: channel.name,
                id: channel.id,
                guild: channel.guild,
                nsfw: channel.nsfw,
            };
            const message = `In '${ch.name}' of [${ch.guild}] \`ID:${ch.id}\``;
            const res = {
                info: ch,
                message: message,
            };
            return res;
        }
    }

    /**
     * Gets the date input and returns a 6-digit number. Useful for patch numbers.
     * @param {string} date
     * @param {string} month
     * @param {string} year
     */
    convertDate(date, month, year)
    {
        if (
            typeof (date, month, year) !== 'string' &&
            typeof (date, month, year) !== 'number'
            ) {
                throw new Error ('[Global Functions > ConvertDate] Invalid input type given.');
            }
        if (typeof year === 'number') {
            year = `${year}`;
        }
        return `${month}${date}${year.substr(2, 2)}`;
    }

    /**
     * (in dev)
     * @param {array} array The input array. Type sensitive.
     * @param {array?} WarnArray (optional) The array used for warn logs. `null` if not specified.
     * @param {string?} type The type of data you want to filter. `item` if not specified.
     */
    duplicationCheck(array, type, WarnArray)
    {
        if (!WarnArray || WarnArray === undefined) WarnArray = null;
        if (!type || type === undefined) type = 'Item';
        if (typeof type !== 'string') throw new Error('[Global Functions > Duplication Check] The type specified is not a string.');
        const findDuplicates = arr => arr.filter((item, index) => arr.indexOf(item) != index);
        const res = [...new Set(findDuplicates(array))];
        if (res.length > 0)
        {
            switch(WarnArray)
            {
                case null:
                {
                    WarnArray = [];
                    for(const i in res)
                    {
                        WarnArray.push(`${type} "${res[i]}": Duplicates found.`);
                    }
                    this.log('warn', this.joinArrayString(WarnArray));
                    break;
                }
                case WarnArray:
                {
                    for(const i in res)
                    {
                        WarnArray.push(`${type} "${res[i]}": Duplicates found.`);
                    }
                }
            }
        }
    }

    /**
     * Returns a time object.
     */
    DateTime()
    {
        const date = new Date();
        const now = Date.now();
        const time = date.toTimeString();
        const month = date.getMonth() + 1;
        const res = {
            now: now,
            date: `${date.getDate() < 10 ? '0' : ''}${date.getDate()}`,
            dateID: `${Math.floor(Date.now() / 86400000)}`,
            month: `${month < 10 ? '0' : ''}${month}`,
            GMT: date.toString().substr(28, 5),
            year: date.getFullYear(),
            hrs: time.substr(0, 2),
            min: time.substr(3, 2),
            sec: time.substr(6, 2),
        };
        return res;
    }

    getExtension(filename)
    {
        if (typeof filename !== 'string') throw new Error('The filename is not a string.');
        const i = filename.lastIndexOf('.');
        return (i < 0) ? '' : filename.substr(i);
    }

    /**
     * (extendable method) Gets a file's stats.
     * @param filename The file to be processed.
     */
    getFileStats(filename)
    {
        const FileSystem = require('fs');
        const stats = FileSystem.statSync(filename);
        const res = {
            size: stats["size"],
        };
        return res;
    }

    joinArrayString(stringArray)
    {
        if (stringArray === null || stringArray === undefined) return false;
        if (stringArray.length < 1) return this.log('warn', 'ArrayString has no item.');
        if (stringArray.length === 1) return `${stringArray[0]}`;
        if (stringArray.length > 1)
        {
            const res = stringArray.join('\n');
            return res;
        }
    }

    /**
     * The global logger module.
     * @param {string} logLevel The level of the log. `info | warn | error | debug | verbose | silly`. `status` by default won't log to file.
     * @param {string} logMessage The message to pass in.
     */
    log(logLevel, logMessage)
    {
        if (!logMessage) throw new Error('[Global Functions > Logger] Cannot log an empty message.');
        if (typeof logLevel !== 'string' || typeof logMessage !== 'string')
        {
            throw new Error('[Global Functions > Logger]: Invalid  input type given. Expected type \'string\'.');
        }
        const { dateID, hrs, min, sec, GMT } = this.DateTime();
        const Timestamp = `(${dateID} - ${hrs}:${min}:${sec}) <${GMT}>`;
        let startPoint = '>';
        let outputLevel;
        if (logLevel.toLowerCase() === 'err') logLevel = 'error';

        const Winston = require('winston');
        const chalk = require('chalk');
        const logger = Winston.createLogger({
            transports: [
              new Winston.transports.File({ filename: '../log.log', json: false, level: 'info' }),
              new Winston.transports.File({ filename: '../log.log', json: false, level: 'warn' }),
              new Winston.transports.File({ filename: '../log.log', json: false, level: 'debug' }),
              new Winston.transports.File({ filename: '../log.log', json: false, level: 'verbose' }),
              new Winston.transports.File({ filename: '../log.log', json: false, level: 'silly' }),
              new Winston.transports.File({ filename: '../error.log', json: false, level: 'error' }),
            ],
            format: Winston.format.printf(log =>
                `[${log.level.toUpperCase()}] - ${Timestamp} \n${log.message}`,
            ),
        });

        const Header = `[${logLevel.toUpperCase()}]`;
        switch (logLevel.toLowerCase()) {
            case 'info': {
                const hex = chalk.hex('#30e5fc');
                outputLevel = hex(Header);
                startPoint = hex(startPoint);
                break;
            }
            case 'warn': {
                const hex = chalk.hex('#ffc430');
                outputLevel = chalk.bgHex('#ffc430').hex('000000')(Header);
                startPoint = hex(startPoint);
                break;
            }
            case 'debug': {
                const hex = chalk.hex('#ed6300');
                outputLevel = hex(Header);
                startPoint = hex(startPoint);
                break;
            }
            case 'verbose': {
                const hex = chalk.hex('#ffffff');
                outputLevel = hex(Header);
                startPoint = hex(startPoint);
                break;
            }
            case 'silly': {
                const hex = chalk.hex('#cf05f2');
                outputLevel = hex(Header);
                startPoint = hex(startPoint);
                break;
            }
            case 'error': {
                const hex = chalk.hex('#ff2b2b');
                outputLevel =  chalk.bgHex('#ff2b2b').hex('ffffff')(Header);
                startPoint = hex(startPoint);
                break;
            }
            case 'status': {
                const hex = chalk.hex('#30e5fc');
                outputLevel = hex(Header);
                startPoint = hex(startPoint);
                break;
            }
            default: break;
        }

        if (outputLevel === undefined) outputLevel = logLevel;
        if (logLevel.toLowerCase() === 'status') return console.log(outputLevel + ' '  + chalk.hex('#8c8c8c')(Timestamp) + `\n` + startPoint + ` ${logMessage}`);

        console.log(outputLevel + ' '  + chalk.hex('#8c8c8c')(Timestamp) + `\n` + startPoint + ` ${logMessage}`);
        return logger.log(logLevel.toLowerCase(), logMessage);
    }

    /**
     * A method that returns an element of the array by random.
     * @param input The array to pass in.
     */
    Responses(input)
    {
        if (!input.length || input.length < 1) throw new Error('');
        const output = input[Math.floor(Math.random() * input.length)];
        return output;
    }

    Test()
    {
        const Sayuri = require('../Main');
        console.log(Sayuri);
    }

    /** Updates this program's version and rewrites `package.json`.
     *
     * @param {string} updateCode Specifies the update type. `1: major | 2: minor | 3: patch`
     * @param {string?} patchNumber Patch number of the update. If `updateCode` is `0` then this parameter is not being used.
     * @param {string} path The path to `package.json` file loacted from this method's location. It's mostly located at the root directory.
     * @param {boolean?} pushOnMinor Decides whether should you push the update onto the Minor section per 1000 patches.
     */
    UpdatePush(path, updateCode, patchNumber, pushOnMinor)
    {
        const FileSystem = require('fs');
        const Package = require(path);
        if (pushOnMinor === null || pushOnMinor === undefined) pushOnMinor = false;
        if (!Package.version) throw new Error('Have you included the version number of this program \'package.json\' correctly?');
        const VersionArray = Package.version.split('.');
        let Major = parseInt(VersionArray[0]);
        let Minor = parseInt(VersionArray[1]);
        let Patch = parseInt(VersionArray[2]);

        if (updateCode === null || updateCode === undefined) updateCode = 2;
        if (typeof updateCode === 'string')
        {
            if (updateCode.toLowerCase() === 'major') updateCode = 0;
            if (updateCode.toLowerCase() === 'minor') updateCode = 1;
            if (updateCode.toLowerCase() === 'patch') updateCode = 2;
            else updateCode = parseInt(updateCode);
        }
        if (updateCode !== 0 && updateCode !== 1 && updateCode !== 2) throw new Error('Invalid update code.');
        if (patchNumber)
        {
            patchNumber = parseInt(patchNumber);
            if (typeof patchNumber !== 'number') throw new Error('Patch number provided must be a number.');
        }
        if (patchNumber === null) patchNumber = 1;

        if (updateCode === 0)
        {
            Major++;
        }
        if (updateCode === 1)
        {
            const int = parseInt(patchNumber);
            Minor = Minor + int;
        }
        if (updateCode === 2)
        {
            const int = parseInt(patchNumber);
            Patch = Patch + int;
        }

        const newVersion = `${Major}.${Minor}.${Patch}`;
        Package.version = newVersion;

        return FileSystem.writeFileSync(path, JSON.stringify(Package, null, 4));
    }
};