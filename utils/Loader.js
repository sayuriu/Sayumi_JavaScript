const FileSystem = require('fs');
const Path = require('path');
const Function = require('./Functions');
const { exception } = require('console');
const functions = new Function;

const Directory = [];

module.exports = class Loader {

    /** Loads the executable from specified directory and pass onto the `client` object.
     * @param {string} pathName The name of the folder that you wanna scan.
     * @param {object} client The client to pass in.
     * @param {string?} Root Root directory located from this file's location. `./` if it's not specified.
     * @param {boolean} subfolder If the file which called this method is located in a subfolder to Root.
     * @param {boolean?} subfolder If the file which called this method is located in a subfolder to Root. `false`by default.
    */
    ExeLoader(pathName, client, Root, subfolder)
    {
        if (subfolder === undefined || subfolder === null) subfolder = false;
        if (typeof subfolder !== 'boolean') throw new Error('[CommandLoader] The last parameter if specified must a boolean.');
        const AliasesArray = [];
        if (!Root || Root === null) Root = './';
        const hostFolder = {
            name: pathName,
            files: [],
            folders: [],
            parent: false,
            exe: [],
            unexec: 0,
            empty: 0,
            dev: 0,
        };
        if (Root === '..') Root = '../';
        if (typeof pathName !== 'string' || typeof Root !== 'string') throw new Error('[CommandLoader] pathName or Root provided is not a string.');
        const { files, folders } = hostFolder;

        // Stage 1: Pre-scan. This filters files and folders and put them into corresponding arrays.
        FileSystem.readdirSync(subfolder ? Root + pathName : pathName).forEach(file => {
            const fullPath = Path.join(pathName, file);
            // console.log(`"${fullPath}": ${FileSystem.lstatSync(fullPath).isDirectory()}`);
                if (FileSystem.lstatSync(subfolder ? Root + fullPath : fullPath).isDirectory()) folders.push({
                name: file,
                files: [],
                subfolders: [],
                parent: true,
                exe: [],
                unexec: 0,
                empty: 0,
                dev: 0,
            });
            else files.push(file);
        });

        // Stage 2.1: Load files inside the host folder if present.
        if (files.length > 0)
        {
            const WarnLog = [];
            for (let i = 0; i < files.length; i++)
            {
                const file = files[i];
                const fullPath = Path.join(pathName, file);
                this.CommandCheck(file, AliasesArray, fullPath, client, hostFolder, WarnLog, Root, subfolder);
            }
            if (WarnLog.length > 0) functions.log('warn', functions.joinArrayString(WarnLog));
       }

        // Stage 2.2: Load subfolders.
        if (folders.length > 0)
        {
            // If there is only a subfolder
            if (folders.length === 1)
            {
                const WarnLog = [];
                const target = folders[0];
                const Folder = Path.join(Root, pathName, target.name);
                FileSystem.readdirSync(Folder).forEach(file => {
                    const fullPath = Path.join(Folder, file);
                    if (FileSystem.lstatSync(fullPath).isDirectory()) target.subfolders.push(file);
                    this.CommandCheck(file, AliasesArray, fullPath, client, target, WarnLog, Root, subfolder);
                });
                if (target.files.length < 1 && target.subfolders.length < 1)
                {
                    WarnLog.push(`"${Folder}": This folder is empty!`);
                }
                if (WarnLog.length > 0) functions.log('warn', functions.joinArrayString(WarnLog));
            }

            // If there are 2 or more subfolders
            else
            {
                for (let i = 0; i < folders.length; i++)
                {
                    const WarnLog = [];
                    const target = folders[i];
                    const Folder = Path.join(pathName, target.name);
                    FileSystem.readdirSync(subfolder ? Root + Folder : Folder).forEach(file => {
                        const fullPath = Path.join(Folder, file);
                        if (FileSystem.lstatSync(subfolder ? Root + fullPath : fullPath).isDirectory()) target.subfolders.push(file);
                        this.CommandCheck(file, AliasesArray, fullPath, client, target, WarnLog, Root, subfolder);
                    });
                    if (target.files.length < 1 && target.subfolders.length < 1)
                    {
                        WarnLog.push(`"${Folder}": This folder is empty!`);
                    }
                    if (WarnLog.length > 0) functions.log('warn', functions.joinArrayString(WarnLog));
                }
            }
        }
        functions.duplicationCheck(AliasesArray, 'Alias');
        return hostFolder;
    }

    /** Loads events from specified diretory and initiate event listeners.
     * @param {string} pathName The name of the folder that you wanna scan.
     * @param {object} client The client to pass in.
     * @param {string?} Root Root directory located from this file's location. `./` if it's not specified.
     * @returns `object`
    */
    EventLoader(pathName, client, Root)
    {
        if (!Root || Root === null) Root = './';
        const hostFolder = {
            name: pathName,
            files: [],
            folders: [],
            parent: false,
            evt: [],
            dev: 0,
            empty: 0,
        };
        if (Root === '..') Root = '../';
        if (typeof pathName !== 'string' || typeof Root !== 'string') throw new Error('[EventLoader] pathName or Root provided is not a string.');
        const { files, folders } = hostFolder;

        // Stage 1: Pre-scan. This filters files and folders and put them into corresponding arrays.
        FileSystem.readdirSync(pathName).forEach(file => {
            const fullPath = Path.join(pathName, file);
                if (FileSystem.lstatSync(fullPath).isDirectory()) folders.push({
                name: file,
                files: [],
                subfolders: [],
                parent: true,
                evt: [],
                dev: 0,
                empty: 0,
            });
            else files.push(file);
        });

        // Stage 2.1: Load files if present.
        if (files.length > 0)
        {
            const WarnLog = [];
            for (let i = 0; i < files.length; i++)
            {
                const file = files[i];
                const fullPath = Path.join(pathName, file);
                this.EventCheck(file, fullPath, client, hostFolder, WarnLog, Root);
            }
            if (WarnLog.length > 0) functions.log('warn', functions.joinArrayString(WarnLog));
        }

        // Stage 2.2: Load subfolders.
        if (folders.length > 0)
        {
            // If there is only a subfolder
            if (folders.length === 1)
            {
                const WarnLog = [];
                const target = folders[0];
                const Folder = Path.join(pathName, target.name);
                // console.log("true:", FileSystem.readdirSync(Path.join(pathName, target.name)));
                FileSystem.readdirSync(Folder).forEach(file => {
                    const fullPath = Path.join(Folder, file);
                    if (FileSystem.lstatSync(fullPath).isDirectory()) target.subfolders.push(file);
                    this.EventCheck(file, fullPath, client, target, WarnLog, Root);
                });
                if (target.files.length < 1 && target.subfolders.length < 1)
                {
                    WarnLog.push(`"${Folder}": This folder is empty!`);
                }
                if (WarnLog.length > 0) functions.log('warn', functions.joinArrayString(WarnLog));
            }

            // If there are 2 or more subfolders
            else
            {
                for (let i = 0; i < folders.length; i++)
                {
                    const WarnLog = [];
                    const target = folders[i];
                    const Folder = Path.join(pathName, target.name);
                    FileSystem.readdirSync(Folder).forEach(file => {
                        const fullPath = Path.join(Folder, file);
                        if (FileSystem.lstatSync(fullPath).isDirectory()) target.subfolders.push(file);
                        this.EventCheck(file, fullPath, client, target, WarnLog, Root);
                    });
                    if (target.files.length < 1 && target.subfolders < 1)
                    {
                        WarnLog.push(`"${Folder}": This folder is empty!`);
                    }
                    if (WarnLog.length > 0) functions.log('warn', functions.joinArrayString(WarnLog));
                }
            }
        }
        return hostFolder;
    }

    // TODO: Add counter and some minor functions

    // Counter(Dir, type)
    // {
    //     if (typeof )
    // }

    // if (typeof Dir !== 'object') throw new Error('The directory provided is not an object.');
    //     if (Dir.files) Dir.File = Dir.files.length;
    //     if (Dir.dev) Dir.Unstable = Dir.dev;
    //     if (Dir.empty) Dir.Empty = Dir.empty;
    //     if (Dir.unexec) Dir.Unexecutable = Dir.unexec;
    //     if (Dir.File > 0)  {
    //         if (Dir.File === Dir.Unexecutable) console.log(`> "${Dir.name}": Successfully loaded ${Dir.File} disabled file${Dir.File > 1 ? 's' : ''}`);
    //         else if (Dir.File === Dir.Unstable) console.log(`> "${Dir.name}": Successfully loaded ${Dir.File} unstable file${Dir.File > 1 ? 's' : ''}`);
    //         else if (Dir.File === Dir.Empty) console.log(`> "${Dir.name}": Successfully loaded ${Dir.File} empty file${Dir.File > 1 ? 's' : ''}`);
    //         else console.log(`> "${Dir.name}": Successfully loaded ${Dir.File} file${Dir.File > 1 ? 's' : ''}`);
    //     }
    //     if (Dir.Unstable > 0 && Dir.Unstable !== Dir.File) {
    //         const res = [
    //             `with ${Dir.Unstable} file${Dir.Unstable > 1 ? 's' : ''} unstable`,
    //             `with ${Dir.Unstable} unstable file${Dir.Unstable > 1 ? 's' : ''}`,
    //         ];
    //         console.log(functions.Responses(res));
    //     }
    //     if (Dir.Unexecutable > 0 && Dir.Unexecutable !== Dir.File) {
    //         const res = [
    //             `with ${Dir.Unexecutable} file${Dir.Unexecutable > 1 ? 's' : ''} disabled`,
    //             `with ${Dir.Unexecutable} disabled file${Dir.Unexecutable > 1 ? 's' : ''}`,
    //         ];
    //         console.log(functions.Responses(res));
    //     }
    //     if (Dir.Empty > 0 && Dir.Empty !== Dir.File) {
    //         const res = [
    //             `with ${Dir.Empty} file${Dir.Empty > 1 ? 's' : ''} empty`,
    //             `with ${Dir.Empty} empty file${Dir.Empty > 1 ? 's' : ''}`,
    //         ];
    //         console.log(functions.Responses(res));
    //     }

    /** Check executables from a file and bind them to the `client` object.
     * @param {string} file Name of the file you want to scan.
     * @param {array} AliasesArray (Must have) This is used for checking duplications in command aliases later on.
     * @param {string} path The path to the file.
     * @param {object} client The client to pass in.
     * @param {object?} object The object used in the nested method. Refer to Loader functions.
     * @param {array?} warnArray The array used for warnings in console.
     * @param {string?} Root The root directory located from this method. This may get removed in future optimizations.
     * @param {boolean?} subfolder If the file which called this method is located in a subfolder to Root. `false`by default.
     * @see method `Loader.EventLoad` ('Loader.js')
     */
    CommandCheck(file, AliasesArray, path, client, object, warnArray, Root, subfolder)
    {
        if (subfolder === undefined || subfolder === null) subfolder = false;
        if (typeof subfolder !== 'boolean') throw new Error('[CommandCheck] The last parameter if specified must a boolean.');
        if (object.parent) object.files.push(file);
        if (file.endsWith('.js'))
        {
            let availablity = true;
            let CommandFile;
            if (Root) CommandFile = require(Root + path);
            if (!Root || Root === null || Root === undefined) CommandFile = require(path);

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
                if (availablity === true) object.unexec++;
                availablity = false;
            }
            // Check for stablity status
            if (!stable || stable === false)
            {
                if (availablity === true) object.unexec++;
                if (onTrigger || typeof onTrigger === 'function')
                {
                    object.exe.push(`${file} (dev)`);
                    object.dev++;
                }
            }
            if (functions.getFileStats(subfolder ? Root + path : path).size === 0)
            {
                if (availablity === true) object.unexec++;
                object.empty++;
                availablity = false;
            }
            if (availablity ===  true)
            {
                client.CommandList.set(name, CommandFile);
                if (CommandFile.aliases)
                {
                    AliasesArray.push(aliases);
                    client.CommandAliases.set(aliases, name);
                }
            }
        }
    }

    /** Check events from a file and bind them to the `client` object.
     * @param {string} file Name of the file you want to scan.
     * @param {string} path The path to the file.
     * @param {object} client The client to pass in.
     * @param {object?} object The object used in the nested method. Refer to Loader functions.
     * @param {array?} warnArray The array used for warnings in console.
     * @param {string?} Root The root directory located from this method. This may get removed in future optimizations.
     * @see method `Loader.EventLoad` ('Loader.js')
     */
    EventCheck(file, path, client, object, warnArray, Root)
    {
        if (object.parent) object.files.push(file);
        if (file.endsWith('.js'))
        {
            let availablity = true;
            let EventFile;
            if (Root) EventFile = require(Root + path);
            if (!Root || Root === null || Root === undefined) EventFile = require(path);

            let { stable } = EventFile;
            const { name, onEmit, once } = EventFile;

            if (!stable) stable = false;

            // If the event object has a name
            if (name)
            {
                if (stable === false)
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
            if (functions.getFileStats(path).size === 0)
            {
                availablity = false;
                object.empty++;
            }
            if (availablity ===  true)
            {
                object.evt.push(file);
                if (once)
                {
                    client.once(name, onEmit.bind(null, client));
                }
                else client.on(name, onEmit.bind(null, client));
            }
        }
    }

};