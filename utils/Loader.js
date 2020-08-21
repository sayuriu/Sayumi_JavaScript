const FileSystem = require('fs');
const Path = require('path');
const Function = require('./Functions');
const functions = new Function;

const Directory = [];

module.exports = class Loader {
    ExeLoader(pathName, client, Root)
    {
        if (!Root || Root === null) Root = '.';
        const hostFolder = {
            name: pathName,
            files: [],
            folders: [],
            parent: false,
            exe: 0,
            unexec: 0,
            empty: 0,
            dev: 0,
        };
        if (typeof pathName !== 'string' || typeof Root !== 'string') throw new Error('pathName or Root provided is not a string.');
        const { files, folders } = hostFolder;
        FileSystem.readdirSync(pathName).forEach(file => {
            const fullPath = Path.join(Root, pathName, file);
                if (FileSystem.lstatSync(fullPath).isDirectory()) folders.push({
                name: file,
                files: [],
                subfolders: [],
                parent: true,
                exe: 0,
                unexec: 0,
                empty: 0,
                dev: 0,
            });
            else files.push(file);
        });
        // Loads the files inside the host folder
        if (files.length)
        {
            const WarnLog = [];
            for (let i = 0; i < files.length; i++)
            {
                const fullPath = Path.join(Root, pathName, files[i]);
                if (files[i].endsWith('.js'))
                {
                    let availablity = true;
                    const Command = require(fullPath);
                    if (!Command.name || typeof Command.name !== 'string')
                    {
                        WarnLog.push(`"${fullPath}": The command has either no name or invalid name type.`);
                        hostFolder.unexec++;
                        availablity = false;
                    }
                    if (!Command.issue || Command.issue === null)
                    {
                        WarnLog.push(`${Command.name ? `Command "${Command.name}" has either no or invalid functions` : `File "${fullPath}" has either no or invalid functions and name.`}`);
                        if (availablity === true) hostFolder.unexec++;
                        hostFolder.unexec++;
                        availablity = false;
                    }
                    if (Command.status === 'dev')
                    {
                        hostFolder.dev++;
                    }
                    if (functions.getFileStats(fullPath).size === 0) hostFolder.empty++;
                    else
                    {
                        client.CommandList.set(Command.name || `"${files[i].split(".").pop()}"`, Command.issue || null);
                        hostFolder.exe++;
                    }
                }
            }
            if (WarnLog.length > 0) functions.log('warn', functions.joinArrayString(WarnLog));
       }
       // Loads / reads inside subfolders
       if (folders.length > 0)
       {
            // If there is only a subfolder
            if (folders.length === 1)
            {
                const WarnLog = [];
                const target = folders[0];
                const Folder = Path.join(Root, pathName, target.name);
                console.log(Folder);
                FileSystem.readdirSync(Folder).forEach(file => {
                    const fullPath = Path.join(Folder, file);
                    if (FileSystem.lstatSync(fullPath).isDirectory()) target.subfolders.push(file);
                    if (file.endsWith('.js'))
                    {
                        let availablity = true;
                        target.files.push(file);
                        const Command = require(fullPath);
                        if (!Command.name || typeof Command.name !== 'string')
                        {
                            WarnLog.push(`"${fullPath}": The command has either no name or invalid name type.`);
                            if (!Command.name) Command.name = `"${file}"`;
                            availablity = false;
                            target.unexec++;
                        }
                        if (!Command.issue || Command.issue === null)
                        {
                            WarnLog.push(`${Command.name ? `Command "${Command.name}" has either no or invalid functions` : `File "${fullPath}" has either no or invalid functions and name.`}`);
                            if (availablity === true) target.unexec++;
                            availablity = false;
                            Command.issue = null;
                        }
                        if (Command.status === 'dev')
                        {
                            target.dev++;
                        }
                        client.CommandList.set(Command.name, Command);
                        if (Command.aliases) client.CommandAliases.set(Command.aliases, Command.name);
                    }
                    else if (!file.endsWith('.js'))
                    {
                        target.files.push(file);
                    }
                });
                if (target.files.length < 1)
                {
                    return functions.log('warn', `"${Folder}": This folder is empty!`);
                }
                if (WarnLog.length > 0) functions.log('warn', functions.joinArrayString(WarnLog));
            }

           // If there are 2 or more subfolders
            else
            {
                // Load each folder, according to the array
                for (let i = 0; i < folders.length; i++)
                {
                    const WarnLog = [];
                    const target = folders[i];
                    const Folder = Path.join(Root, pathName, target.name);
                    FileSystem.readdirSync(Folder).forEach(file => {
                        const fullPath = Path.join(Folder, file);
                        if (FileSystem.lstatSync(fullPath).isDirectory()) target.subfolders.push(file);
                        if (file.endsWith('.js'))
                        {
                            let availablity = true;
                            target.files.push(file);
                            const Command = require(fullPath);
                            if (!Command.name || typeof Command.name !== 'string')
                            {
                                WarnLog.push(`"${fullPath}": The command has either no name or invalid name type.`);
                                if (!Command.name) Command.name = `${file}`;
                                target.unexec++;
                                availablity = false;
                            }
                            if (!Command.issue || Command.issue === null)
                            {
                                WarnLog.push(`${Command.name ? `Command "${Command.name}" has either no or invalid functions` : `File "${fullPath}" has either no or invalid functions and name.`}`);
                                if (availablity === true) target.unexec++;
                                availablity = false;
                                Command.issue = null;
                            }
                            if (Command.status === 'dev')
                            {
                                target.dev++;
                            }
                            if (Command.issue) target.exe++;
                            client.CommandList.set(Command.name, Command);
                            if (Command.aliases) client.CommandAliases.set(Command.aliases, Command.name);
                        }
                        else if (!file.endsWith('.js'))
                        {
                            target.files.push(file);
                        }
                    });
                    if (target.files.length < 1)
                    {
                        return functions.log('warn', `"${Folder}": This folder is empty!`);
                    }
                    if (WarnLog.length > 0) functions.log('warn', functions.joinArrayString(WarnLog));
                }
            }
       }
       return hostFolder;
    }
    // {
    //     name: '../utils',
    //     files: [ 'Client.js', 'Date.js', 'embeds.js', 'Functions.js', 'Loader.js' ],
    //     folders: [
    //                          {
    //                              name: "let's go",
    //                              files: [],
    //                              parent: true
    //                          }
    //                   ],
    //      parent: false
    //  }

    EventLoader(pathName, client)
    {

    }
 
    DatabaseModel(pathName, client)
    {

    }

    Counter(Dir)
    {
        if (typeof Dir !== 'object') throw new Error('The directory provided is not an object.');
        if (Dir.File > 0)  {
            if (Dir.File === Dir.Unexecutable) console.log(`> "${Dir.name}": Successfully loaded ${Dir.File} disabled file${Dir.File > 1 ? 's' : ''}`);
            else if (Dir.File === Dir.Unstable) console.log(`> "${Dir.name}": Successfully loaded ${Dir.File} unstable file${Dir.File > 1 ? 's' : ''}`);
            else if (Dir.File === Dir.Empty) console.log(`> "${Dir.name}": Successfully loaded ${Dir.File} empty file${Dir.File > 1 ? 's' : ''}`);
            else console.log(`> "${Dir.name}": Successfully loaded ${Dir.File} file${Dir.File > 1 ? 's' : ''}`);
        }
        if (Dir.Unstable > 0 && Dir.Unstable !== Dir.File) {
            const res = [
                `with ${Dir.Unstable} file${Dir.Unstable > 1 ? 's' : ''} unstable`,
                `with ${Dir.Unstable} unstable file${Dir.Unstable > 1 ? 's' : ''}`,
            ];
            console.log(functions.Responses(res));
        }
        if (Dir.Unexecutable > 0 && Dir.Unexecutable !== Dir.File) {
            const res = [
                `with ${Dir.Unexecutable} file${Dir.Unexecutable > 1 ? 's' : ''} disabled`,
                `with ${Dir.Unexecutable} disabled file${Dir.Unexecutable > 1 ? 's' : ''}`,
            ];
            console.log(functions.Responses(res));
        }
        if (Dir.Empty > 0 && Dir.Empty !== Dir.File) {
            const res = [
                `with ${Dir.Empty} file${Dir.Empty > 1 ? 's' : ''} empty`,
                `with ${Dir.Empty} empty file${Dir.Empty > 1 ? 's' : ''}`,
            ];
            console.log(functions.Responses(res));
        }
    }

    ParentFolderCheck(path, parentFolder)
    {
        if (typeof path !== 'string')
        {
            path = `${path}`;
        }
        if (typeof parentFolder !== 'string')
        {
            parentFolder = `${parentFolder}`;
        }
        const pathArray = path.split("\\" || "/");
        console.log(pathArray);
        if (pathArray.some(parentFolder)) return true;
        return false;
    }

    CommandCheck(FileArray)
    {
        if (FileArray.length < 1) return false;
        else
        {
            for (let i = 1; i < FileArray.length; i++)
            {
                const OnCheck = FileArray[i];
            }
        }
    }

    RecursiveLoadModules(directory, client)
    {
        FileSystem.readdirSync(directory).forEach(file => {
            const fullPath = Path.join('..', directory, file);
            if (file === "deps.js" || file === "settings.js") return;
            if (FileSystem.lstatSync(fullPath).isDirectory()) {
            this.RecursiveLoadModules(fullPath, client);
            } else if (file.endsWith(".js")) {
            const command = require(fullPath);
            client.CommandList.set(command.name, command);
            client.CommandAliases.set(command.aliases, command.name);
            }
        });
    }

    LoadCommands(client)
    {
        FileSystem.readdirSync(Path.join('..', 'executables')).forEach(file => {
            if (file.endsWith('js'))
            {
                const cmd = require(`../executables/${file}`);
                client.CommandList.set(cmd.name, cmd);
                client.AliasesList.set(cmd.aliases, cmd.name);
            }
        });
    }
};

// Array contains objects, then each object contains another array......
// Sync up parameters and link methods.