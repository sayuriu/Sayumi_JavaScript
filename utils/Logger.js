// @ts-check

const { createLogger, transports, format } = require('winston');
const chalk = require('chalk');
const { existsSync, mkdirSync } = require('fs');
const DateTime = require('./functions/time-manupilation/date-time');
const logDir = `${__dirname}/../../logs/`;

function logCarrier(logLevel, logMessage)
{
	let obj;
	if (!existsSync(logDir)) mkdirSync(logDir);

	if (!logMessage) throw new SyntaxError('[Global Functions > Logger] Cannot log an empty message.');
	if (typeof logLevel !== 'string')throw new TypeError('[Global Functions > Logger] Invalid log level given. Expected type \'string\'.');
	if (typeof logMessage !== 'string') {
		if (typeof logMessage === 'object') {
			obj = logMessage;
			logMessage = `[Object]`;
		}
		else logMessage = `${logMessage}`;
	}
	const { dateID, hrs, min, sec, GMT } = DateTime();
	const Timestamp = `(${dateID} - ${hrs}:${min}:${sec}) <${GMT}>`;
	let startPoint = '>';
	let outputLevel;
	let functionClass;

	if (logLevel.toLowerCase() === 'err') logLevel = 'error';

	if (logMessage.startsWith('[') && logMessage.includes(']'))
	{
		functionClass  = logMessage.slice(logMessage.indexOf('['), logMessage.indexOf(']') + 1) || '';
		logMessage = logMessage.slice(logMessage.indexOf(']') + 1, logMessage.length);
	}
	const functionClass_00 = functionClass;

	if (logLevel === 'error' && functionClass.match(/Unhandled Promise Rejection/g))
	{
		logMessage = logMessage.split('\n');
		const message = logMessage[0].trim() || '';
		const stack = logMessage.splice(1, logMessage.length).join('\n').trimLeft();
		const stackArray = stack.split('\n');
		let name = stackArray[0].slice(0, stackArray[0].length - message.length - 2);
		name.length ? name = `: ${name}` : name;
		functionClass = `${functionClass.slice(0, functionClass.length - 1)}${name}]`;
		logMessage = `${message}\nStack calls:\n${stackArray.splice(1, stackArray.length).join('\n')}`;
	}

	const loggerOut = createLogger({
		transports: [
			new transports.File({ filename: `${logDir}/log.log`, level: 'info' }),
			new transports.File({ filename: `${logDir}/log.log`, level: 'warn' }),
			new transports.File({ filename: `${logDir}/log.log`, level: 'debug' }),
			new transports.File({ filename: `${logDir}/log.log`, level: 'verbose' }),
			new transports.File({ filename: `${logDir}/log.log`, level: 'silly' }),
			new transports.File({ filename: `${logDir}/errors.log`, level: 'error', handleExceptions: true }),
		],
		format: format.printf(log =>
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
				outputLevel = chalk.bgHex('#ff2b2b').hex('ffffff')(Header);
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
	if (!outputLevel) outputLevel = logLevel;

	functionClass = chalk.hex('#9c9c9c')(functionClass);
	const output = outputLevel + ' '  + chalk.hex('#8c8c8c')(Timestamp) + ' ' + functionClass + `\n` + startPoint + ` ${logMessage}`;
	if (logLevel.toLowerCase().startsWith('status:'))
	{
		if (!logLevel.split('status:')[1].length) return this.carrier('err', '[Global Functions > Logger]: Empty status message.');
		if (obj !== undefined) return console.log(output, obj);
		else return console.log(output);
	}

	console.log(output);
	return loggerOut.log(logLevel.toLowerCase(), logMessage);
}

/** The global logger module. */
module.exports = {
	// In case you want to do status message, you might wanna call the carrier itself.

	/** Inform time!
	 * @param {string} message The message to pass in.
	 */
	info: (message) => {
		return logCarrier('info', message);
	},

	/** Gives out a warning.
	 * @param {string} message The message to pass in.
	 */
    warn: (message) => {
		return logCarrier('warn', message);
	},

	/** Push out an error when something goes wrong.
	 * @param {string} message The message to pass in.
	 */
    error: (message) => {
		return logCarrier('error', message);
	},

	/** If you need to debug...
	 * @param {string} message The message to pass in.
	 */
	debug: (message) => {
		return logCarrier('debug', message);
	},

	/**
     * Print out a custom message.
     * @param {string} logLevel The level of the log. `info | warn | error | debug | verbose | silly`. `status: StatusMessage` by default won't log to file.
     * @param {string} logMessage The message to pass in.
     */
    carrier: (logLevel, logMessage) => {
		return logCarrier(logLevel, logMessage);
	},
};