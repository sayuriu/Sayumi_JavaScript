import * as FileSystem from 'fs';
import * as responses from './json/Responses.json';
import * as logger from './Logger';
import * as chalk from'chalk';

import { config } from 'dotenv';
import { ChannelData } from 'discord.js';

type Sayumi_Commands = object;
type Channel = ChannelData;

declare class Methods
{
    public static ArrayEqualityCheck(Array1: Array[], Array2: Array[]): boolean
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
    };
	public static ArrayOrString(input: Array[] | string): { output: Array | any, boolean: boolean };
    public static channelCheck(channel: ChannelData | object): Channel
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
            return {
                info: ch,
                message: message,
            };
        }
    };
	public static clean(input: string): string;
	public static convertBytes(bytes: number): string;
	public static convertDate(date: number | string, month: number | string, year: number | string): string;
	public static CompareObjects(target: object, source: object): boolean;
	/** Stating files in the console output.
     * @param {object} dir The directory object to pass in. Usually it's taken from the loader.
     * @param {string} type The type of data you want to inspect. For Discord, it's reduced to commands, events and database models. This will be added more in the future.
     * @see method `Loader.ExeLoader` and `Loader.EventLoader` (Loader.js)
     */
    public static Counter(dir: object, type: string): void 
    {
        if (typeof dir !== 'object') return logger.error('[Global Functions > File Counter] Directory given is not an object.');
        if (typeof type !== 'string') return logger.error('[Global Functions > File Counter] The type specified is not a string.');
        const inspector = type.toLowerCase();

        const validInput = ['executables', 'commands', 'cmd', 'events', 'evt', 'database', 'db'];
        if (!validInput.some(item => item === inspector)) return logger.error('[Global Functions > File Counter] Wrong type given.');

        // If commands
        if (inspector === 'executables' || inspector === 'commands' || inspector === 'cmd')
        {
            const { name, files, folders, subfolders, exe, unexec, parent, parentName, empty, dev, size } = dir;
            let Header = chalk.hex('#83cc04')(`${parent ? 'Subfolder | ' : 'Parent | '}${parent ? `${parentName} > ${name}` : `"${name}"`} `);
            const log: Array<string> = [];

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
            const { name, files, folders, subfolders, evt, parent, parentName, empty, dev, size } = dir;
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
    };
	public static duplicationCheck(array: Array<any>, type?: string, WarnArray?: Array<string>): void 
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
	public static DateTime(): {date: string, dateID: string, month: string, GMT: string, year: string, hrs: string, min: string, sec: string};
	public static daysAgo(date: Date, compare?: Date): {daysRaw: number, years: number, month: number, day: number, message: string};
	public static EscapeRegExp(input: string): string { return input.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&'); };
	public static getExtension(fileName: string): string;
	public static getAllFiles(path: string): string[];
	public static joinArrayString(stringArray: string[]): false | string  
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
	};
	public static Greetings(): string
	{
		const greetings = responses.greetings;
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
	};
	public static PermissionsCheck(TargetCommand: Sayumi_Commands)
	{
		let uConfirm: boolean = true;
        let meConfirm: boolean = true;
        let array: boolean = false;
        const required: any[] = [];
        if (Array.isArray(TargetCommand.reqPerms))
        {
            TargetCommand.reqPerms.forEach(permission => {
                if (message.member.permissions.has(permission)) return;
                uConfirm = false;
            });

            TargetCommand.reqPerms.forEach(permission => {
                if (message.guild.me.permissions.has(permission)) return;

                required.push(permission);
                array = true;
                meConfirm = false;
            });
        }
        else
        {
            if (!message.member.permissions.has(TargetCommand.reqPerms)) uConfirm = false;
            if (!message.guild.me.permissions.has(TargetCommand.reqPerms)) meConfirm = false;
        }
        return { clientPass: meConfirm, userPass: uConfirm, required: required, array: array };
	};
	public static Randomized(input: any[]): any {
		if (!input) return logger.error('[Global Functions > Responses] The input is undefined!');
        if (!input.length || input.length < 1) return logger.error(`[Global Functions > Responses] ${this.Randomized(responses.errors.functions_responses)}`);
        const output = input[Math.floor(Math.random() * input.length)];
        return output;
	}
	public static ShiftToLast(array: any[], callback: Function): Array[] { return array =  array.push(array.splice(array.findIndex(callback), 1)[0]); }
}

module.exports = Methods;