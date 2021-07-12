const { lstatSync, statSync, readdirSync, writeFileSync } = require('fs');
const { join } = require('path');
const ParseError = require('./functions/common/parse-errors');
const chalk = require('chalk');
const groupSettings = require('./GroupSettings');

class Loader
{
    constructor(client, pathAndType)
    {
        // Loader
        this.mainRoot = client.ROOT_DIR;
        this.dirIndex = {
            size: 0,
            invalidNames: [],
            noFunc: [],
            emptyFiles: [],
            errored: [],
        };

        // stdout
        this.loaded = 0;
        this.empty = 0;
        [this.path, this.type] = pathAndType;

        // @flag:rewrite?
        this.stdoutSignalSend = function(data)
        {
            switch (data)
            {
                case 'start-scan':
                {
                    const string = chalk.hex('#30e5fc')('[Bootstrap] ')
                                        + chalk.hex('8c8c8c')(`scan ${this.type}: `)
                                        + chalk.hex('#c15ee6')(this.path)
                                        + ' scanning';
                    return process.stdout.write(string);
                }
                case 'end-scan':
                {
                    const string = chalk.hex('#30e5fc')('[Bootstrap] ')
                                        + chalk.hex('8c8c8c')(`scan ${this.type}: `)
                                        + chalk.hex('#c15ee6')(this.path)
                                        + ' complete\n';
                    process.stdout.cursorTo(0);
                    return process.stdout.write(string);
                }
            }
        };

        this.stdoutSignalSend('start-scan');
        this.recursiveLoad(this.path, client, this.type);
        this.stdoutSignalSend('end-scan');
        summarize(this, this.type, client);
    }

    recursiveLoad(dir, client, type)
    {
        readdirSync(dir).forEach(file => {
            const dirPath = join(dir, file);
            const fullPath = join(this.mainRoot, dirPath);

            if (lstatSync(fullPath).isDirectory()) return this.recursiveLoad(dirPath, client, type);
            if (file.endsWith('.js')) ParseCheck(type, fullPath, client, this);
        });
        if (type === 'cmd') BindCategory(client);
    }
}

function ParseCheck(type, path, client, data)
{
    // let availability = true;
    let { size: sizec } = data.dirIndex || { size: 0 };
    const { invalidNames, emptyFiles, noFunc, errored } =  data.dirIndex || { invalidNames: [], emptyFiles: [], noFunc: [], errored: [] };
    try {
        let object = require(path);
        const { name } = object;
        const size = statSync(path)['size'];
        sizec += size;

        this.path = path.split('\\').splice(3, path.split('\\').length).join('\\');

        // Empty eh...
        if (!size) return emptyFiles.push(this.path);

        // Check for name
        if (!name || typeof name !== 'string') return invalidNames.push(this.path);

        if (type === 'cmd')
        {
            const { aliases, onTrigger, group } = object;

            // Group settings
            if (group?.length)
            {
                for (let i = 0; i < group.length; i++)
                {
                    if (Object.keys(groupSettings).includes(group[i]))
                    {
                        const configs = {};
                        const { global, groups } = groupSettings[group[i]];
                        for (const option in groups)
                        {
                            if (groups[option].includes(name)) configs[option] = true;
                        }
                        object = Object.assign(object, configs, global ? global : {});
                    }
                }
            }

            // Check for command's functions
            if (!onTrigger || typeof onTrigger !== 'function') return noFunc.push(name ? `"${name}": ${this.path}` : this.path);

            client.CommandList.set(
                name,
                Object.assign(
                    object,
                    { memWeight: size, loadTime: Date.now() },
                ),
            );
            if ((aliases || []).length) client.CommandAliases.set(aliases, name);
            data.loaded++;
        }

        if (type === 'evt')
        {
            const { once, onEmit, music } = object;

            if (!onEmit || typeof onEmit !== 'function') return noFunc.push(name ? `"${name}": ${this.path}` : this.path);

            // Remove old identical listeners if found to prevent overlapping
            if (music)
            {
                client.MusicPlayer.removeAllListeners(name);
                client.MusicPlayer.on(name, onEmit.bind(null, client));
            }
            else
            {
                client.removeAllListeners(name);
                once ? client.once(name, onEmit.bind(null, client)) : client.on(name, onEmit.bind(null, client));
            }
            process.env.HANDLED_EVENTS++;
            data.loaded++;
        }
    } catch (e) {
        errored.push(e);
    }
    Object.assign(data.dirIndex, { invalidNames, emptyFiles, noFunc, size: sizec, errored });
}

function summarize(data, type, client)
{
    const { ConvertBytes: calBytes } = client.Methods.Data;
    const cmdc = client.CommandList.size;
    const typec = type.replace(/cmd/, 'command').replace(/evt/, 'event');
    const { dirIndex } = data;
    if (type === 'cmd')
    {
        console.log(`${chalk.hex('#8c8c8c')(`[${calBytes(dirIndex.size)}]`)} ${chalk.hex('#2dd66b')(`${cmdc} ${typec}${cmdc > 1 ? 's' : ''}`)}`);
        Object.assign(dirIndex, { EntriesToCMD: EntryMergeAll(client) });
    }
    if (type === 'evt') console.log(`${chalk.hex('#8c8c8c')(`[${calBytes(dirIndex.size)}]`)} ${chalk.hex('#2dd66b')(`${process.env.HANDLED_EVENTS} ${typec}${process.env.HANDLED_EVENTS > 1 ? 's' : ''}`)}`);

    IssueWarns(dirIndex, type);
}

/** Sums up all command names and aliases into an array. */
function EntryMergeAll(client)
{
    const allNames = [];
    let allAliases = [];

    for (const key of client.CommandList.keys())
    {
        allNames.push(key);
    }
    for (const key of client.CommandAliases.keys())
    {
        if (Array.isArray(key)) allAliases = allAliases.concat(key);
        else allAliases.push(key);
    }

    return [].concat(allNames, allAliases);
}

function IssueWarns(dirIndex, type)
{
    const { invalidNames, emptyFiles, noFunc, EntriesToCMD, errored } = dirIndex;
    type = type.replace(/cmd/, 'command').replace(/evt/, 'event');

    function out(item, customString)
    {
        process.stdout.write(customString);
        item.forEach(i => process.stdout.write(`  ${chalk.hex('#b5b5b5')(i)}\n`));
        process.stdout.write('\n');
    }

    if (invalidNames.length) out(invalidNames, `${invalidNames.length} file${invalidNames.length > 1 ? 's' : ''} with ${chalk.hex('#e38c22')('no or invalid names')}:\n`);
    if (emptyFiles.length) out(emptyFiles, `${emptyFiles.length} ${chalk.hex('#8f8f8f')(`empty file${emptyFiles.length > 1 ? 's' : ''}`)}:\n`);
    if (noFunc.length) out(noFunc, `${noFunc.length} ${type}${noFunc.length > 1 ? 's' : ''} with ${chalk.hex('#cfcfcf').bgHex('#ff3333')('no callbacks')}:\n`);

    if (errored.length)
    {
        const map = new Map();
        errored.forEach(e => ParseError(e, map));

        if (!map.size) return process.stdout.write(`An ${chalk.hex('#d13636')(`error`)} has been detected while loading assets. Please attach breakpoints on this function next time to track down.\n`);
        process.stdout.write(`Those files had ${chalk.hex('#d13636')(`errors`)} while compiling and skipped:\n`);
        for (const entry of map.entries())
        {
            const errorName = entry[0];
            const errorStacks = entry[1];

            process.stdout.write(chalk.hex('#212121').bgHex('#a8a8a8')(`${errorName}\n`));
            errorStacks.forEach(stack => {
                const [eMessage, location, line] = stack;
                process.stdout.write(`  ${chalk.hex('#7a7a7a')('line')} ${chalk.hex('#b8b8b8')(`${line}`)} ${chalk.hex('#7a7a7a')('of')} ${chalk.hex('#b5b5b5')(location)}: ${eMessage}\n`);
            });
            process.stdout.write('\n');
        }
    }
    if ((EntriesToCMD || []).length)
    {
        const dupFinder = arr => arr.filter((entry, index) => arr.indexOf(entry) !== index);
        const res = [...new Set(dupFinder(EntriesToCMD))];
        if (res.length)
        {
            const targetList = [];
            for (const i in res)
            {
                targetList.push(res[i]);
            }
            if (targetList.length)
            {
                const outString = `${targetList.length} ${chalk.hex('#c9c7c7').bgHex('#c46e49')(`duplicated command entr${targetList.length > 1 ? 'ies' : 'y'}`)} found.\n Unstability may occur when executing ${targetList.length > 1 ? 'those entries' : 'this entry'}:\n  `
                                        + `${chalk.hex('#9c9679')(targetList.join('\n  '))}\n`;
                process.stdout.write(outString + '\n');
            }
        }
    }
}

/** Binds each command loaded from the list to its approriate c ategories.
 * @param {object} client The client to pass in.
 */
function BindCategory(client)
{
    const groupArray = [];
    const object = require('../utils/json/Categories.json');
    client.CategoryCompare = new (require('discord.js')).Collection();

    // Set categories for comparing
    for (const category in object)
    {
        const target = object[category];
        client.CategoryCompare.set(target.name, target.keywords);
    }

    // Get all category entries
    client.CommandList.forEach(commandObject => {
        if (Array.isArray(commandObject.group))
        {
            commandObject.group.forEach(element => {
                if (!groupArray.some(item => item === element)) groupArray.push(element);
            });
        }

        let AssignedGroup = commandObject.group;
        if (!AssignedGroup) AssignedGroup = 'Unassigned';
        if (!groupArray.some(item => item === AssignedGroup)) groupArray.push(AssignedGroup);
    });

    const odd = [];

    groupArray.forEach(element => {
        if (Object.keys(object).some(i => i === element)) return;
        else odd.push(element);
    });

    if (odd.length) odd.forEach(element => {
        if (Array.isArray(element)) return;
        object[element] = {
            name: element,
            descriptions: '',
            colorCode: '#000000',
            keywords: [],
        };
    });

    // Now, for each command object...
    groupArray.forEach(group => {
        if (Array.isArray(group)) return;
        const commandArray = [];
        const underDevArray = [];

        client.CommandList.forEach(cmd => {
            let affectedCommand;
            if (Array.isArray(cmd.group))
                affectedCommand = cmd.group.some(name => name === group);
            else
            {
                if (!cmd.group) cmd.group = 'Unassigned';
                affectedCommand = cmd.group === group;
            }
            if (affectedCommand)
            {
                commandArray.push(cmd.name);
                if (cmd.flags && cmd.flags.some(i => i === 'Under Developement')) underDevArray.push(cmd.name);
            }
        });

        const groupObject = {
            name: group,
            descriptions: object[group].descriptions,
            colorCode: object[group].colorCode,
            commands: commandArray,
            underDev: underDevArray,
            keywords: client.CategoryCompare.get(group) || [group.toLowerCase()],
        };
        client.CommandCategories.set(group, groupObject);
    });

    object.lastUpdated = Date.now();
    writeFileSync('./utils/json/Categories.json', JSON.stringify(object, null, 4));
}

module.exports = {
    Loader,
    ParseCheck,
    IssueWarns,
};
