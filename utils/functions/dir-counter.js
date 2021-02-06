// @flagged:deprecated

const { error: outerr } = require('../Logger');
const chalk = require('chalk');
const randomize = require('./common/randomize');
const joinArrayString = require('./common/join-array-to-str');

/** Stating files in the console output.
 * @param {object} dir The directory object to pass in. Usually it's taken from the loader.
 * @param {string} type The type of data you want to inspect. For Discord, it's reduced to commands, events and database models. This will be added more in the future.
 * @see method `Loader.ExeLoader` and `Loader.EventLoader` (Loader.js)
 */
module.exports = function(dir, type)
{
	if (typeof dir !== 'object') return outerr('[Global Functions > File Counter] Directory given is not an object.');
	if (typeof type !== 'string') return outerr('[Global Functions > File Counter] The type specified is not a string.');
	const inspector = type.toLowerCase();

	const TypeofCommand = ['executables', 'commands', 'cmd'];
	const TypeofEvent = ['events', 'evt'];
	const TypeofDatabase = ['database', 'db'];

	if (![].concat(TypeofCommand, TypeofEvent, TypeofDatabase).some(item => item === inspector)) return outerr('[Global Functions > File Counter] Wrong type given.');

	// If commands
	if (TypeofCommand.some(n => n === inspector))
	{
		const { name, files, folders, subfolders, exe, unexec, parent, parentName, empty, dev, size } = dir;
		const log = [];

		let Header = chalk.hex('#83cc04')(`${parent ? 'Subfolder | ' : 'Parent | '}${parent ? `${parentName} > ${name}` : `"${name}"`}`);

		if (files.length) switch(files.length)
		{
			case unexec:
			{
				Header += extendHeader_File('disabled', files.length);
				break;
			}
			case dev:
			{
				Header += extendHeader_File('unstable', files.length);
				break;
			}
			case empty:
			{
				Header += extendHeader_File('empty', files.length);
				break;
			}
			default: Header += extendHeader_File('', files.length);
		}

		if (parent && subfolders.length) Header += extendHeader_Secondary(`, ${subfolders.length} folder${subfolders.length > 1 ? 's' : ''}`);
		if (!parent && folders.length) Header += extendHeader_Secondary(`, ${folders.length} folder${folders.length > 1 ? 's' : ''}`);

		Header += extendHeader_Secondary(` [${size}]`);
		exe.length ? log.push('Loaded ' + chalk.hex('#04a7cc')(`${exe.length} command${exe.length > 1 ? 's' : ''}`)) : null;

		if (dev && dev !== files.length)
			log.push('Found ' + chalk.hex('#04cc93')(
				randomize([
					`${dev} file${dev > 1 ? 's' : ''} in developement`,
					`${dev} unstable file${dev > 1 ? 's' : ''}`,
				]),
			));

		if (empty && empty !== files.length)
			log.push('Found ' + chalk.hex('#fc8c03')(
				randomize([
					`${empty} file${empty > 1 ? 's' : ''} empty`,
					`${empty} empty file${empty > 1 ? 's' : ''}`,
				]),
			));

		if (unexec && unexec !== files.length)
			log.push('Found ' + chalk.hex('#8c8c8c')(`${unexec} non-executable${unexec > 1 ? 's' : ''}`));

		console.log(Header);
		if (log.length) console.log(joinArrayString(log));
	}

	// If events
	if (TypeofEvent.some(n => n === inspector))
	{
		const { name, files, folders, subfolders, evt, parent, parentName, empty, dev, size } = dir;
		const log = [];

		let Header = chalk.hex('#83cc04')(`${parent ? 'Subfolder | ' : 'Parent | '}${parent ? `${parentName} > ${name}` : `"${name}"`} `);

		if (files.length) switch(files.length)
		{
			case dev:
			{
				Header += extendHeader_Evt('unstable', files.length);
				break;
			}
			case empty:
			{
				Header += extendHeader_File('empty', files.length);
				break;
			}
			default: Header += extendHeader_File('', files.length);
		}

		if (parent && subfolders.length) Header += extendHeader_Secondary(`, ${subfolders.length} folder${subfolders.length > 1 ? 's' : ''}`);
		else if ((folders || []).length) Header += extendHeader_Secondary(`, ${folders.length} folder${folders.length > 1 ? 's' : ''}`);

		Header += extendHeader_Secondary(`[${size}]`);
		evt.length ? log.push('Bound ' + chalk.hex('#04a7cc')(`${evt.length} event${evt.length > 1 ? 's' : ''}`)) : null;

		if (dev && dev !== files.length)
			log.push('Found ' + chalk.hex('#04cc93')(
				randomize([
					`${dev} event${dev > 1 ? 's' : ''} in developement`,
                    `${dev} unstable event${dev > 1 ? 's' : ''}`,
				]),
			));

		if (empty && empty !== files.length)
		log.push('Found ' + chalk.hex('#fc8c03')(
			randomize([
				`${empty} file${empty > 1 ? 's' : ''} empty`,
				`${empty} empty file${empty > 1 ? 's' : ''}`,
			]),
		));

		const nonEvent = files.length - evt.length;
		if (nonEvent) log.push('Found ' + chalk.hex('#8c8c8c')(`${nonEvent} misc file${nonEvent > 1 ? 's' : ''}`));

		console.log(Header);
		if (log.length) console.log(joinArrayString(log));
	}
	return void {};
};

const extendHeader_File = (icase = '', fileLength) => extendHeader_Secondary(`${fileLength}${icase} file${fileLength > 1 ? 's' : ''}`);
const extendHeader_Evt = (icase = '', fileLength) => extendHeader_Secondary(`${fileLength} ${icase} event${fileLength > 1 ? 's' : ''}`);
const extendHeader_Secondary = (msg) => chalk.hex('#8c8c8c')(' ' + msg);
