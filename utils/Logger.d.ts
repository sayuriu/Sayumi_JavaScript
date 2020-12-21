declare class Logger {
	public info(message: string): this;
	public warn(message: string): this;
	public error(message: string): this;
	public debug(message: string): this;
	public carrier(
		logLevel: 'info' | 'warn' | 'error' | 'debug' | 'verbose' | 'silly', 
		logMessage: string
	): this;
}

module.exports = Logger;