const FileSystem = require('fs');
const discord = require('discord.js');
const responses = require('./responses.json');
const chalk = require('chalk');
const Logger = require('./Logger');
const logger = new Logger;
require('dotenv').config();

module.exports = class Functions  {

    // Some methods are dedicated to a specific command or class, but here you go.

    ArrayEqualityCheck(Array1, Array2)
    {
        if (!Array.isArray(Array1) || !Array.isArray(Array2) || Array1.length !== Array2.length)
        return false;

        const arr1 = Array1.concat().sort();
        const arr2 = Array2.concat().sort();

        for (let i = 0; i < arr1.length; i++)
        {
            if (arr1[i] !== arr2[i])
                return false;
        }

        return true;
    }

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

    /** Returns a file / folder's size.
     * @param {number} bytes The size to pass in.
     */
    convertBytes(bytes)
    {
        const sizes = ["Bytes", "kB", "MB", "GB", "TB"];

        if (bytes == 0) {
            return "n/a";
        }

        const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));

        if (i == 0) {
            return bytes + " " + sizes[i];
        }

        return (bytes / Math.pow(1024, i)).toFixed(1) + " " + sizes[i];
    }

    /** Gets the date input and returns a 6-digit number. Useful for patch numbers.
     * @param {string} date
     * @param {string} month
     * @param {string} year
     * @see procedure `Functions.DateTime` (Function.js)
     */
    convertDate(date, month, year)
    {
        if (
            typeof (date, month, year) !== 'string' &&
            typeof (date, month, year) !== 'number'
            ) {
                throw new TypeError ('[Global Functions > ConvertDate] Invalid input type given.');
            }
        if (typeof year === 'number') {
            year = `${year}`;
        }
        return `${month}${date}${year.substr(2, 2)}`;
    }

    CompareObjects(target, source)
    {
        if (typeof target !== 'object') throw new TypeError('[Global Functions > Object Comparison] The target must be an object.');
        if (typeof source !== 'object') throw new TypeError('[Global Functions > Object Comparison] The source must be an object.');
        for (const key in source)
		{
			if (Object.prototype.hasOwnProperty.call(source, key))
			{
				if (target[key] !== source[key]) return false;
				else return true;
			}
		}
    }

    /** Stating files in the console output.
     * @param {object} dirObject The directory object to pass in. Usually it's taken from the loader.
     * @param {string} type The type of data you want to inspect. For Discord, it's reduced to commands, events and database models. This will be added more in the future.
     * @see method `Loader.ExeLoader` and `Loader.EventLoader` (Loader.js)
     */
    Counter(dirObject, type)
    {
        if (typeof dirObject !== 'object') return logger.error('[Global Functions > File Counter] Directory given is not an object.');
        if (typeof type !== 'string') return logger.error('[Global Functions > File Counter] The type specified is not a string.');
        const inspector = type.toLowerCase();

        const validInput = ['executables', 'commands', 'cmd', 'events', 'evt', 'database', 'db'];
        if (!validInput.some(item => item === inspector)) return logger.error('[Global Functions > File Counter] Wrong type given.');

        // If commands
        if (inspector === 'executables' || inspector === 'commands' || inspector === 'cmd')
        {
            const { name, files, folders, subfolders, exe, unexec, parent, parentName, empty, dev, size } = dirObject;
            let Header = chalk.hex('#83cc04')(`${parent ? 'Subfolder | ' : 'Parent | '}${parent ? `${parentName} > ${name}` : `"${name}"`} `);
            const log = [];

            if (files.length > 0)
            {
                if (files.length === unexec) Header = Header + chalk.hex('#8c8c8c')(`${files.length} disabled file${files.length > 1 ? 's' : ''}`);
                else if (files.length === dev) Header = Header + chalk.hex('#8c8c8c')(`${files.length} unstable file${files.length > 1 ? 's' : ''}`);
                else if (files.length === empty) Header = Header + chalk.hex('#8c8c8c')(`${files.length} empty file${files.length > 1 ? 's' : ''}`);
                else Header = Header + chalk.hex('#8c8c8c')(`${files.length} file${files.length > 1 ? 's' : ''}`);
            }

            if (parent)
            {
                if (subfolders.length > 0) Header = Header + chalk.hex('#8c8c8c')(`, ${subfolders.length} folder${subfolders.length > 1 ? 's' : ''}`);
            }
            else if (parent === false)
            {
                if (folders.length > 0) Header = Header + chalk.hex('#8c8c8c')(`, ${folders.length} folder${folders.length > 1 ? 's' : ''}`);
            }
            Header = Header + chalk.hex('#8c8c8c')(` [${size}]`);

            if (exe.length > 0)
            {
                log.push('Loaded ' + chalk.hex('#04a7cc')(`${exe.length} command${exe.length > 1 ? 's' : ''}`));
            }
            if (dev > 0 && dev !== files.length)
            {
                const res = [
                    `${dev} file${dev > 1 ? 's' : ''} in developement`,
                    `${dev} unstable file${dev > 1 ? 's' : ''}`,
                ];
                log.push('Found ' + chalk.hex('#04cc93')(this.Randomized(res)));
            }
            if (empty > 0 && empty !== files.length)
            {
                const res = [
                    `${empty} file${empty > 1 ? 's' : ''} empty`,
                    `${empty} empty file${empty > 1 ? 's' : ''}`,
                ];
                log.push('Found ' + chalk.hex('#fc8c03')(this.Randomized(res)));
            }
            if (unexec > 0 && unexec !== files.length)
            {
                log.push('Found ' + chalk.hex('#8c8c8c')(`${unexec} non-executable${unexec > 1 ? 's' : ''}`));
            }
            console.log(Header);
            if (log.length > 0) console.log(this.joinArrayString(log));
        }

        // If events
        if (inspector === 'event' || inspector === 'evt')
        {
            const { name, files, folders, subfolders, evt, parent, parentName, empty, dev, size } = dirObject;
            let Header = chalk.hex('#83cc04')(`${parent ? 'Subfolder | ' : 'Parent | '}${parent ? `${parentName} > ${name}` : `"${name}"`} `);
            const log = [];

            if (files.length > 0)
            {
                if (files.length === dev) Header = Header + chalk.hex('#8c8c8c')(`${files.length} unstable event${files.length > 1 ? 's' : ''}`);
                else if (files.length === empty) Header = Header + chalk.hex('#8c8c8c')(`${files.length} empty file${files.length > 1 ? 's' : ''}`);
                else Header = Header + chalk.hex('#8c8c8c')(`${files.length} file${files.length > 1 ? 's' : ''}`);
            }

            if (parent)
            {
                if (subfolders.length > 0) Header = Header + chalk.hex('#8c8c8c')(`, ${subfolders.length} folder${subfolders.length > 1 ? 's' : ''}`);
            }
            else if (parent === false)
            {
                if (folders.length > 0) Header = Header + chalk.hex('#8c8c8c')(`, ${folders.length} folder${folders.length > 1 ? 's' : ''}`);
            }
            Header = Header + chalk.hex('#8c8c8c')(` [${size}]`);

            if (evt.length > 0)
            {
                log.push('Bound ' + chalk.hex('#04a7cc')(`${evt.length} event${evt.length > 1 ? 's' : ''}`));
            }
            if (dev > 0 && dev !== files.length)
           {
                const res = [
                    `${dev} event${dev > 1 ? 's' : ''} in developement`,
                    `${dev} unstable event${dev > 1 ? 's' : ''}`,
                ];
                log.push('Found ' + chalk.hex('#04cc93')(this.Randomized(res)));
            }
            if (empty > 0 && empty !== files.length)
            {
                const res = [
                    `${empty} file${empty > 1 ? 's' : ''} empty`,
                    `${empty} empty file${empty > 1 ? 's' : ''}`,
                ];
                log.push('Found ' + chalk.hex('#fc8c03')(this.Randomized(res)));
            }
            const nonEvent = files.length - evt.length;
            if (nonEvent > 0)
            {
                log.push('Found ' + chalk.hex('#8c8c8c')(`${nonEvent} misc file${nonEvent > 1 ? 's' : ''}`));
            }
            console.log(Header);
            if (log.length > 0) console.log(this.joinArrayString(log));
        }
    }

    /** Checks an array and returns warnings if duplications are found.
     * @param {array} array The input array. Type sensitive.
     * @param {array?} WarnArray (optional) The array used for warn logs. `null` if not specified.
     * @param {string?} type The type of data you want to filter. `item` if not specified.
     */
    duplicationCheck(array, type, WarnArray)
    {
        if (!WarnArray || WarnArray === undefined) WarnArray = null;
        if (!type || type === undefined) type = 'Item';
        if (typeof type !== 'string') throw new TypeError('[Global Functions > Duplication Check] The type specified is not a string.');
        type = type.replace(type.substr(0, 1), type.substr(0, 1).toUpperCase());
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
                    if (WarnArray.length > 0) logger.warn(this.joinArrayString(WarnArray));
                    break;
                }
                case WarnArray:
                {
                    for(const i in res)
                    {
                        if (WarnArray.length > 0) WarnArray.push(`${type} "${res[i]}": Duplicates found.`);
                    }
                }
            }
        }
    }

    /** Returns a time object. */
    DateTime()
    {
        const date = new Date();
        const time = date.toTimeString();
        const month = date.getMonth() + 1;
        const res = {
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

    escapeRegExp(string)
    {
        return string.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&');
    }

    /** (ecessive method) Gets a file's last extension.
     * @param {string} filename The file's name.
     */
    getExtension(filename)
    {
        if (typeof filename !== 'string') throw new TypeError('The filename is not a string.');
        const i = filename.lastIndexOf('.');
        return (i < 0) ? '' : filename.substr(i);
    }

    /** Loads all files from target directory and returns them in array.
     * @param {string} path The directory you need to scan.
     */
    getAllFiles(path)
    {
        const Path = require('path');
        const files = FileSystem.readdirSync(path);

        let arrayOfFiles = [];

        files.forEach(file => {
            const fullPath = Path.join(path, file);
            if (FileSystem.statSync(fullPath).isDirectory()) {
                arrayOfFiles = this.getAllFiles(fullPath, arrayOfFiles);
            } else {
                arrayOfFiles.push(Path.join(path, file));
            }
        });

        return arrayOfFiles;
    }

    /** Calculates total file sizes from a given array of file paths.
     * @param {string} path The directory you need to scan.
     */
    getTotalSize(path)
    {
        const arrayOfFiles = this.getAllFiles(path);

        let totalSize = 0;

        arrayOfFiles.forEach(filePath => {
            totalSize += FileSystem.statSync(filePath).size;
        });

        return this.convertBytes(totalSize);
    }

    /** (miscellaneous method) Used for logging.
     * @param {array} stringArray The array to pass in.
     */
    joinArrayString(stringArray)
    {
        if (stringArray === null || stringArray === undefined) return false;
        if (stringArray.length < 1) return logger.warn('ArrayString has no item.');
        // if (stringArray.length < 1) throw new ReferenceError('ArrayString has no item.');
        if (stringArray.length === 1) return `${stringArray[0]}`;
        if (stringArray.length > 1)
        {
            const res = stringArray.join('\n');
            return res;
        }
    }

    /** (miscellaneous method) Greets you in the terminal everytime you boot the program. */
    Greetings()
    {
        const greetings = require('./responses.json').greetings;
        const { hrs, min, sec } = this.DateTime();
        const time = parseInt(hrs) + parseInt(min) / 60 + parseInt(sec) / 3600;
        let output;
        if (time > -1 && time < 24)
        {
            if (time < 12)
            {
                if (time >= 0 && time < 6)
                {
                    output = greetings.daytime.early_morning;
                }
                if (time >= 6 && time < 12)
                {
                    output = greetings.daytime.morning;
                }
            }
            if (time >= 12)
            {
                if (time >= 12 && time < 13)
                {
                    output = greetings.daytime.noon;
                }
                if (time >= 13 && time < 18.75)
                {
                    output = greetings.daytime.afternoon;
                }
                if (time >= 18.75 && time < 22)
                {
                    output = greetings.nighttime.evening;
                }
                if (time >= 22 && time < 24)
                {
                    output = greetings.nighttime.night;
                }
            }
            return this.Randomized(output);
        }
    }

    /** A method that returns an element of the array by random.
     * @param input The array to pass in.
     */
    Randomized(input)
    {
        if (!input) return logger.error('[Global Functions > Responses] The input is undefined!');
        if (!input.length || input.length < 1) return logger.error(`[Global Functions > Responses] ${this.Randomized(responses.errors.functions_responses)}`);
        const output = input[Math.floor(Math.random() * input.length)];
        return output;
    }

    /** Updates this program's version and rewrites `package.json`.
     * @param {string} path The path to `package.json` file loacted from this method's location. It's mostly located at the root directory.
     * @param {string?} updateCode Specifies the update type. `1: major | 2: minor | 3: patch`. `patch` if left blank.
     * @param {string?} patchNumber Patch number of the update. If `updateCode` is `0` then this parameter is not being used.
     * @param {boolean?} pushOnMinor Decides whether should you push the update onto the Minor section per 1000 patches.
     */
    UpdatePush(path, updateCode, patchNumber, pushOnMinor)
    {
        const Package = require(path);
        if (pushOnMinor === null || pushOnMinor === undefined) pushOnMinor = false;
        if (!Package.version) throw new ReferenceError('Have you included the version number of this program \'package.json\' correctly?');
        const VersionArray = Package.version.split('.');
        let Major = parseInt(VersionArray[0]);
        let Minor = parseInt(VersionArray[1]);
        let Patch = parseInt(VersionArray[2]);

        if (updateCode === null || updateCode === undefined || updateCode.trim() === '') updateCode = 2;
        if (typeof updateCode === 'string')
        {
            if (updateCode.toLowerCase() === 'major') updateCode = 0;
            if (updateCode.toLowerCase() === 'minor') updateCode = 1;
            if (updateCode.toLowerCase() === 'patch') updateCode = 2;
            else updateCode = parseInt(updateCode);
        }
        if (updateCode !== 0 && updateCode !== 1 && updateCode !== 2) throw new SyntaxError('Invalid update code.');
        if (patchNumber)
        {
            patchNumber = parseInt(patchNumber);
            if (typeof patchNumber !== 'number') throw new TypeError('Patch number provided must be a number.');
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