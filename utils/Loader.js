// @flagged:needs-optimizations

const { lstatSync, statSync, readdirSync, writeFileSync } = require('fs');
const { join } = require('path');
const { execArgv } = require('process');
const counter = require('./functions/dir-counter');

/** Loads the executable from specified directory and pass onto the `client` object.
 * @param {string} pathName The name of the folder that you wanna scan.
 * @param {object} client The client to pass in.
 * @param {string?} Root Root directory located from this file's location. `./` if it's not specified.
 * @param {boolean} subfolder If the file which called this method is located in a subfolder to Root.
 * @param {boolean?} subfolder If the file which called this method is located in a subfolder to Root. `false`by default.
*/
function ExeLoader(pathName, client, Root, subfolder = false)
{
    client.Log.carrier('status: SCAN', `[Loader] Checking "${pathName}"...`);
    if (typeof subfolder !== 'boolean') throw new Error('[CommandLoader] The last parameter if specified must a boolean.');
    const AliasesArray = [];
    const hostFolder = {
        name: pathName,
        files: [],
        folders: [],
        parent: false,
        exe: [],
        unexec: 0,
        empty: 0,
        dev: 0,
        size: 'n/a',
    };
    if (typeof pathName !== 'string' || typeof Root !== 'string') throw new Error('[CommandLoader] pathName or Root provided is not a string.');
    const { files, folders } = hostFolder;

    // If the host folder is empty, escape immediately to prevent wasting memory
    hostFolder.size = client.Methods.DirSet.GetTotalSize(subfolder ? Root + pathName : pathName);
    if (hostFolder.size === 'n/a') return client.Log.warn(`[Loader] "${subfolder ? Root + pathName : pathName}": This folder is empty!`);

    // Stage 1: Pre-scan. This filters files and folders and put them into corresponding arrays.
    readdirSync(subfolder ? Root + pathName : pathName).forEach(file => {
        const fullPath = join(pathName, file);
        if (lstatSync(subfolder ? Root + fullPath : fullPath).isDirectory()) folders.push({
            name: file,
            files: [],
            subfolders: [],
            parent: true,
            parentName: pathName,
            exe: [],
            unexec: 0,
            empty: 0,
            dev: 0,
        });
        else files.push(file);
    });

    // Stage 2.1: Load files inside the host folder if present.
    if (files.length)
    {
        const WarnLog = [];
        for (let i = 0; i < files.length; i++)
        {
            const file = files[i];
            const fullPath = join(pathName, file);
            CommandCheck(file, AliasesArray, fullPath, client, WarnLog, hostFolder, Root, subfolder);
        }
        if (WarnLog.length) client.Log.warn(client.Methods.Common.JoinArrayString(WarnLog));
    }
    counter(hostFolder, 'cmd');

    // Stage 2.2: Load subfolders.
    if (folders.length)
    {
        // If there is only a subfolder
        if (folders.length === 1)
        {
            const WarnLog = [];
            const target = folders[0];
            const Folder = join(pathName, target.name);
            target.size = client.Methods.DirSet.GetTotalSize(subfolder ? Root + Folder : Folder);
            readdirSync(Folder).forEach(file => {
                const fullPath = join(Folder, file);
                CommandCheck(file, AliasesArray, fullPath, client, WarnLog, target, Root, subfolder);
            });
            if (target.files.length || target.subfolders.length)
            {
                counter(target, 'cmd');
                writeFileSync(`${Folder}/${target.name}.json`, JSON.stringify(target, null, 4));
            }
            if (!target.files.length && !target.subfolders.length)
            {
                WarnLog.push(`"${Folder}": This folder is empty!`);
            }
            if (WarnLog.length) client.Log.warn(`[Executable Loader] ${client.Methods.Common.JoinArrayString(WarnLog)}`);
        }

        // If there are 2 or more subfolders
        else
        {
            for (let i = 0; i < folders.length; i++)
            {
                const WarnLog = [];
                const target = folders[i];
                const Folder = join(pathName, target.name);
                target.size = client.Methods.DirSet.GetTotalSize(subfolder ? Root + Folder : Folder);
                readdirSync(subfolder ? Root + Folder : Folder).forEach(file => {
                    const fullPath = join(Folder, file);
                    CommandCheck(file, AliasesArray, fullPath, client, WarnLog, target, Root, subfolder);
                });
                if (!target.files.length && !target.subfolders.length)
                {
                    WarnLog.push(`"${Folder}": This folder is empty!`);
                }
                if (WarnLog.length) client.Log.warn(`[Executable Loader] ${client.Methods.Common.JoinArrayString(WarnLog)}`);
                if (target.files.length || target.subfolders.length)
                {
                    counter(target, 'cmd');
                    writeFileSync(`${Folder}/${target.name}.json`, JSON.stringify(target, null, 4));
                }
            }
        }
    }
    client.Methods.Common.DuplicationCheck(AliasesArray, 'alias');
    writeFileSync(`${subfolder ? Root + pathName : pathName}/${hostFolder.name}.json`, JSON.stringify(hostFolder, null, 4));
    BindCategory(client);
    return hostFolder;
}

/** Loads events from specified diretory and initiate event listeners.
 * @param {string} pathName The name of the folder that you wanna scan.
 * @param {object} client The client to pass in.
 * @param {string?} Root Root directory located from this file's location. `./` if it's not specified.
 * @returns `object`
*/
function EventLoader(pathName, client, Root, subfolder = false)
{
    process.env.HANDLED_EVENTS = 0;
    client.Log.carrier('status: SCAN', `[Loader] Checking "${pathName}"...`);
    if (typeof subfolder !== 'boolean') throw new Error('[CommandLoader] The last parameter if specified must a boolean.');
    const hostFolder = {
        name: pathName,
        files: [],
        folders: [],
        parent: false,
        evt: [],
        dev: 0,
        empty: 0,
        size: 'n/a',
    };
    if (typeof pathName !== 'string' || typeof Root !== 'string') throw new Error('[EventLoader] pathName or Root provided is not a string.');
    const { files, folders } = hostFolder;

    // If the host folder is empty, escape immediately to prevent wasting memory
    hostFolder.size = client.Methods.DirSet.GetTotalSize(subfolder ? Root + pathName : pathName);
    if (hostFolder.size === 'n/a') return client.Log.warn(`[Loader] "${subfolder ? Root + pathName : pathName}": This folder is empty!`);

    // Stage 1: Pre-scan. This filters files and folders and put them into corresponding arrays.
    readdirSync(pathName).forEach(file => {
        const fullPath = join(pathName, file);
            if (lstatSync(fullPath).isDirectory()) folders.push({
            name: file,
            files: [],
            subfolders: [],
            parent: true,
            parentName: pathName,
            evt: [],
            dev: 0,
            empty: 0,
            size: 'n/a',
        });
        else files.push(file);
    });

    // Stage 2.1: Load files if present.
    if (files.length)
    {
        const WarnLog = [];
        for (let i = 0; i < files.length; i++)
        {
            const file = files[i];
            const fullPath = join(pathName, file);
            EventCheck(file, fullPath, client, hostFolder, WarnLog, Root);
        }
        if (WarnLog.length) client.Log.warn(`[Event Loader]`, client.Methods.Common.JoinArrayString(WarnLog));
    }
    counter(hostFolder, 'evt');

    // Stage 2.2: Load subfolders.
    if (folders.length)
    {
        // If there is only a subfolder
        if (folders.length === 1)
        {
            const WarnLog = [];
            const target = folders[0];
            const Folder = join(pathName, target.name);
            target.size = client.Methods.DirSet.GetTotalSize(subfolder ? Root + Folder : Folder);
            readdirSync(Folder).forEach(file => {
                const fullPath = join(Folder, file);
                EventCheck(file, fullPath, client, target, WarnLog, Root);
            });
            if (!target.files.length && !target.subfolders.length)
            {
                WarnLog.push(`"${Folder}": This folder is empty!`);
            }
            if (WarnLog.length) client.Log.warn(`[Event Loader] ${client.Methods.Common.JoinArrayString(WarnLog)}`);
            if (target.files.length || target.subfolders.length)
            {
                counter(target, 'evt');
                writeFileSync(`${Folder}/${target.name}.json`, JSON.stringify(target, null, 4));
            }
        }

        // If there are 2 or more subfolders
        else
        {
            for (let i = 0; i < folders.length; i++)
            {
                const WarnLog = [];
                const target = folders[i];
                const Folder = join(pathName, target.name);
                target.size = client.Methods.DirSet.GetTotalSize(subfolder ? Root + Folder : Folder);
                readdirSync(Folder).forEach(file => {
                    const fullPath = join(Folder, file);
                    EventCheck(file, fullPath, client, target, WarnLog, Root);
                });
                if (target.files.length < 1 && target.subfolders < 1)
                {
                    WarnLog.push(`"${Folder}": This folder is empty!`);
                }
                if (WarnLog.length) client.Log.warn(`[Event Loader] ${client.Methods.Common.JoinArrayString(WarnLog)}`);
                if (target.files.length || target.subfolders.length)
                {
                    counter(target, 'evt');
                    writeFileSync(`${Folder}/${target.name}.json`, JSON.stringify(target, null, 4));
                }
            }
        }
    }
    writeFileSync(`${subfolder ? Root + pathName : pathName}/${hostFolder.name}.json`, JSON.stringify(hostFolder, null, 4));
}

/** Check executables from a file and bind them to the `client` object.
 * @param {string} file Name of the file you want to scan.
 * @param {array} AliasesArray (Must have) This is used for checking duplications in command aliases later on.
 * @param {string} path The path to the file.
 * @param {object} client The client to pass in.
 * @param {object?} object The object used in the nested method. Refer to Loader functions.
 * @param {array?} warnArray The array used for warnings in console.
 * @param {string?} Root The root directory located from this method. This may get removed in future optimizations.
 * @param {boolean?} subfolder If the file which called this method is located in a subfolder to Root. `false`by default.
 * @see method `Loader.ExeLoader` ('Loader.js')
 */
function CommandCheck(file, AliasesArray, path, client, warnArray, object = {
    exe: [], dev: 0, unexec: 0,
}, Root = null, subfolder =  false)
{
    if (typeof subfolder !== 'boolean') throw new Error('[CommandCheck] The last parameter if specified must a boolean.');
    if (lstatSync(path).isDirectory()) return object.subfolders.push(file);
    if (object.parent) object.files.push(file);
    if (file.endsWith('.js'))
    {
        let availablity = true;
        let dev = false;
        const pathString = Root ? Root + path : path;
        const CommandFile = require(pathString);

        const { name, aliases, stable, onTrigger } = CommandFile;

        // Check for command's name
        if (!name || typeof name !== 'string')
        {
            warnArray.push(`File"${path}": The command has either no name or invalid name type.`);
            object.unexec++;
            availablity = false;
        }
        // Check for command's functions
        if (!onTrigger || typeof onTrigger !== 'function')
        {
            warnArray.push(`${CommandFile.name ? `Command "${CommandFile.name}" has either no or invalid functions` : `File "${path}" has either no or invalid functions and name.`}`);
            if (availablity) object.unexec++;
            availablity = false;
        }
        // Check for stablity status
        if (!stable)
        {
            if (availablity) object.unexec++;
            if (onTrigger || typeof onTrigger === 'function')
            {
                object.exe.push(`${file} (dev)`);
                object.dev++;
                dev = true;
            }
        }
        if (!statSync(path)['size'])
        {
            if (availablity) object.unexec++;
            object.empty++;
            availablity = false;
        }
        if (availablity)
        {
            if (!dev) object.exe.push(`${file}`);
            client.CommandList.set(
                name,
                Object.assign(
                    CommandFile,
                    { memWeight:statSync(path)['size'], loadTime: Date.now(), resolvedPath: require.resolve(pathString) },
                ));
            if (CommandFile.aliases)
            {
                AliasesArray.push(aliases);
                client.CommandAliases.set(aliases, name);
            }
        }
        else object.unexec++;
    }
}

 /** Check events from a file and bind them to the `client` object.
 * @param {string} file Name of the file you want to scan.
 * @param {string} path The path to the file.
 * @param {object} client The client to pass in.
 * @param {object?} object The object used in the nested method. Refer to Loader functions.
 * @param {array?} warnArray The array used for warnings in console.
 * @param {string?} Root The root directory located from this method. This may get removed in future optimizations.
 * @see method `Loader.EventLoader` ('Loader.js')
 */
function EventCheck(file, path, client, object, warnArray, Root = null)
{
    if (lstatSync(path).isDirectory()) return object.subfolders.push(file);
    if (object.parent) object.files.push(file);
    if (file.endsWith('.js'))
    {
        let availablity = true;
        const EventFile = Root ? require(Root + path) : require(path);
        const { name, onEmit, once, stable } = EventFile;

        // If the event object has a name
        if (name)
        {
            if (!stable)
            {
                availablity = false;
                object.evt.push(`${file} (dev)`);
                object.dev++;
            }
            if (!onEmit || typeof onEmit !== 'function')
            {
                availablity = false;
                warnArray.push(`Event "${EventFile.name}" doesn't have any callback function.`);
            }
        }
        if (!statSync(path)['size'])
        {
            availablity = false;
            object.empty++;
        }
        if (availablity)
        {
            // Remove old identical listeners if found identical ones
            if (client.eventNames().some(e => e === name)) client.off(client.eventNames()[client.eventNames().findIndex(e => e === name)], () => null);
            process.env.HANDLED_EVENTS++;
            object.evt.push(file);
            if (once) client.once(name, onEmit.bind(null, client));
            else client.on(name, onEmit.bind(null, client));
        }
    }
}

/** Binds each command loaded from the list to its approriate categories.
 * @param {object} client The client to pass in.
 */
function BindCategory(client)
{
    const groupArray = [];
    const object = require('./json/Categories.json');
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

function Validate(data)
{
    const { type, root: folder } = data;
    if (typeof type !== 'string') throw new Error('[Loader] type: The type specified is not a string.');
    // if (typeof client !== 'object') throw new Error('[Loader] client: The client specified is not an object.');
    if (typeof folder !== 'string') throw new Error('[Loader] folder: The directory specified is not a string.');
}


module.exports = {
    Load: (client, root, ...folders) =>
    {
        if (folders.some(f => f === 'executables')) ExeLoader('executables', client, root);
        if (folders.some(f => f === 'events')) EventLoader('events', client, root);
    },

    CommandCheck: CommandCheck,
    EventCheck: EventCheck,
    BindCategory: BindCategory,
};