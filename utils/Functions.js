module.exports = class Functions  {

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

    convertDate(date, month, year)
    {
        if (
            typeof (date, month, year) !== 'string' &&
            typeof (date, month, year) !== 'number'
            ) {
                throw new Error ('Utils.ConvertDate: Invalid input type given.');
            }
        if (typeof year === 'number') {
            year = `${year}`;
        }
        return `${month}${date}${year.substr(2, 2)}`;
    }

    duplicationCheck(array)
    {
        const duplicatedItems = [];
        for (let i = 0; i < array.length; i++)
        {
            if (array.indexOf(array[i]) !== array.lastIndexOf(array[i]))
            {
                if (duplicatedItems.some) return;
                console.log('WARN', array[i] + ': contains duplicate elements');
                duplicatedItems.push(array[i]);
            }
        }
    }

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

    getFileStats(filename)  {
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

    log(messageLevel, message)
    {
        if (typeof messageLevel !== 'string' || typeof message !== 'string')
        {
            throw new Error('Utils.Logger: Invalid  input type given. Expected type \'string\'.');
        }
        const { dateID, hrs, min, sec, GMT } = this.DateTime();

        const Winston = require('winston');
        const logger = Winston.createLogger({
            transports: [
              new Winston.transports.Console(),
              new Winston.transports.File({ filename: '../log.txt', json: false }),
            ],
            format: Winston.format.printf(log =>
                `[${log.level.toUpperCase()}] - (${dateID} - ${hrs}:${min}:${sec}) <${GMT}> \n${log.message}`),
            });
        return logger.log(messageLevel.toLowerCase(), message);
    }

    Responses(input, output)
    {
        output = input[Math.floor(Math.random() * input.length)];
        return output;
    }

};