/** The global logger module. */
module.exports = class Logger {
	// In case you want to do status message, you might wanna call the carrier itself.

	/** Inform time!
	 * @param {string} message The message to pass in.
	 */
	static info(message)
    {
        return this.carrier('info', message);
	}
	/** Gives out a warning.
	 * @param {string} message The message to pass in.
	 */
    static warn(message)
    {
        return this.carrier('warn', message);
	}
	/** Push out an error when something goes wrong.
	 * @param {string} message The message to pass in.
	 */
	static error(message)
	{
		return this.carrier('error', message);
	}
	/** If you need to debug...
	 * @param {string} message The message to pass in.
	 */
	static debug(message)
	{
		return this.carrier('debug', message);
	}

	/**
     * Print out a custom message.
     * @param {string} logLevel The level of the log. `info | warn | error | debug | verbose | silly`. `status: StatusMessage` by default won't log to file.
     * @param {string} logMessage The message to pass in.
     */
    static carrier(logLevel, logMessage)
    {
        const Winston = require('winston');
        const chalk = require('chalk');
        const FileSystem = require('fs');
        const methods = (require('./Methods'));
        const logDir = `${__dirname}/../logs/`;
        let obj;

        if (!FileSystem.existsSync(logDir)) {
            FileSystem.mkdirSync(logDir);
        }

        if (!logMessage) throw new SyntaxError('[Global Functions > Logger] Cannot log an empty message.');
        if (typeof logLevel !== 'string')
        {
            throw new TypeError('[Global Functions > Logger] Invalid log level given. Expected type \'string\'.');
        }
        if (typeof logMessage !== 'string') {
            if (typeof logMessage === 'object') {
                obj = logMessage;
                logMessage = `[Object]`;
            }
            else logMessage = `${logMessage}`;
        }
        const { dateID, hrs, min, sec, GMT } = methods.DateTime();
        const Timestamp = `(${dateID} - ${hrs}:${min}:${sec}) <${GMT}>`;
        let startPoint = '>';
        let outputLevel;
        let functionClass;

        if (logLevel.toLowerCase() === 'err') logLevel = 'error';

        if (logMessage.startsWith('[') && logMessage.includes(']'))
        {
            functionClass  = logMessage.slice(logMessage.indexOf('['), logMessage.indexOf(']') + 1);
            logMessage = logMessage.slice(logMessage.indexOf(']') + 1, logMessage.length);
        }
        if (functionClass === undefined || functionClass.length < 1) functionClass = '';
        const functionClass_00 = functionClass;

        const logger = Winston.createLogger({
            transports: [
              new Winston.transports.File({ filename: `${logDir}/log.log`, level: 'info', json: false }),
              new Winston.transports.File({ filename: `${logDir}/log.log`, level: 'warn', json: false }),
              new Winston.transports.File({ filename: `${logDir}/log.log`, level: 'debug', json: false }),
              new Winston.transports.File({ filename: `${logDir}/log.log`, level: 'verbose', json: false }),
              new Winston.transports.File({ filename: `${logDir}/log.log`, level: 'silly', json: false }),
              new Winston.transports.File({ filename: `${logDir}/errors.log`, level: 'error', json: false }),
            ],
            format: Winston.format.printf(log =>
                `[${log.level.toUpperCase()}] - ${Timestamp}${functionClass_00 ? ` ${functionClass_00}` : ''} \n${log.message}`,
            ),
        });

        const Levels = ['info', 'warn', 'info', 'debug', 'verbose', 'silly', 'error'];
        const Header = `[${logLevel.toUpperCase()}]`;
        if (Levels.some(item => item === logLevel.toLowerCase()))
        {
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
                default: break;
            }
        }

         if(logLevel.toLowerCase().startsWith('status:'))
         {
            const code = logLevel.split('status:')[1];
            const hex = chalk.hex('#30e5fc');
            outputLevel = hex(`${Header.split(':')[0] + code}]`);
            functionClass = outputLevel.length > 60 ? '' : ' [Terminal]';
            startPoint = hex(startPoint);
        }
        if (outputLevel === undefined) outputLevel = logLevel;

        functionClass = chalk.hex('#9c9c9c')(functionClass);
        const output = outputLevel + ' '  + chalk.hex('#8c8c8c')(Timestamp) + ' ' + functionClass + `\n` + startPoint + ` ${logMessage}`;
        if (logLevel.toLowerCase().startsWith('status:'))
        {
            if (logLevel.split('status:')[1].length < 1) return this.carrier('err', '[Global Functions > Logger]: Empty status message.');
            if (obj !== undefined) return console.log(output, obj);
            else return console.log(output);
        }

        console.log(output);
        return logger.log(logLevel.toLowerCase(), logMessage);
    }
};