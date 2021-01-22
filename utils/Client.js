// Shorten stages of requiring
const { CommandCheck, EventCheck, Load, BindCategory } = require('./Loader');
const { error: outerr, carrier } = require('./Logger');
const http = require('http');
const ClientInit = require('./database/methods/client');

/**
 * Yes.
 */
module.exports = class Sayuri extends ClientInit {
    constructor(data, token)
    {
        const { client, App: app, bugChannel } = data;
        super(client);

        /** Initiates this client instance. */
        this.Init = () => {
            this.Login(client, token);
            this.EventListener(client);
            this.CommandInit(client);
            this.HandleProcessErrors();
            this.KeepAlive(app, true);
            this.Watch('./', client);

            process.env.BUG_CHANNEL_ID = bugChannel || '630334027081056287';
            setTimeout(() => this.DBInit(), 3000);
        };
        this.DBInit = () => super.init(client);
    }

    /**
     * Initiates a login session to Discord.
     * @param {object} client The client to pass in.
     * @param {string} token The token of the client. Refer to [your app's page](https://discord.com/developers/applications) for more details.
     */
    Login(client, token)  {
        if (!client) throw new ReferenceError('[Sayuri > Client] Did you pass the client yet?');
        if (typeof client !== 'object') throw new TypeError('[Sayuri > Client] The client is not an object.');
        if (typeof token !== 'string') throw new TypeError('[Sayuri > Login] The token provided is not a string.');
        client.login(token);
    }

    /**
     * Initiates the event listener.
     * @param {object} client The client to pass in.
     */
    EventListener(client)
    {
        if (!client) throw new ReferenceError('[Sayuri > Client] Did you pass the client yet?');
        if (typeof client !== 'object') throw new TypeError('[Sayuri > Client] The client is not an object.');
        Load(client, '../', 'events');
    }

    /**
     * Loads the executables from the library.
     * @param {object} client The client to pass in.
     */
    CommandInit(client)
    {
        if (!client) throw new ReferenceError('[Sayuri > Client] Did you pass the client yet?');
        if (typeof client !== 'object') throw new TypeError('[Sayuri > Client] The client is not an object.');
        Load(client, '../', 'executables');
    }

    /** This is for handling some additional runtime errors and events. */
    HandleProcessErrors()
    {
        process.on("uncaughtException", error => {
            outerr(`[Uncaught Exception] ${error.message}\n${error.stack}`);
        });
        process.on("unhandledRejection", error => {
            outerr(`[Unhandled Promise Rejection] ${error.message}\n${error.stack}`);
        });
        process.on('exit', code => {
            carrier(`status: ${code}`, `Process instance has exited with code ${code}.`);
        });
    }

    KeepAlive(app, thisHost)
    {
        app.Express.get('/', (req, res) => {
            res.sendStatus(200);
        });
        app.Express.listen(process.env.PORT || 3000);
        setInterval(() => {
            if (thisHost) http.get(app.link);
            else http.get(`${process.env.PROJECT_DOMAIN}.glitch.me`);
        }, 280000);
    }

    Watch(rootDir, client)
    {
        const { watch, stat, readFileSync } = require('fs');
        const { join } = require('path');
        const FSEventTimeout = new (require('discord.js')).Collection();
        this.root = '../';

        watch(rootDir, { recursive: true }, (evt, filename) => {
            if (filename)
            {
                const path = rootDir + filename;
                const requirePath = this.root + filename;
                const printCSLPath = join(requirePath).split('\\').splice(1, join(requirePath).split('\\').length).join('\\');
                const { resolve } = require;
                const file = path.split('\\')[path.split('\\').length - 1];

                const print_change = (cmdOrEvt, warnArray) => {
                    Object.keys(cmdOrEvt).length ?
                    client.Log.debug(`[Reload > ud] Updated ${cmdOrEvt.name || 'something at'} [${printCSLPath.split('\\').join(' > ')}]`) :
                    client.Log.debug(`[Reload > rg] Registered ${cmdOrEvt.name || require(requirePath).name || 'something at'} [${printCSLPath.split('\\').join(' > ')}]`);

                    if (warnArray.length) client.Log.warn(`[Executable Loader] ${client.Methods.Common.JoinArrayString(warnArray)}`);
                };

                const exePath = (requirePath.match(/executables/g) || []).length ? true : false;
                const evtPath = (requirePath.match(/events/g) || []).length ? true : false;

                if (evt === 'change')
                {
                    stat(filename, (e, stats) => {

                        if (e) client.Log.error(`[Reload - FileStats error]\nPath: ${requirePath}\n${e.message}`);
                        if (!FSEventTimeout.get(requirePath))
                        {
                            if (file.endsWith('.js'))
                            {
                                if (requirePath.match(/node_modules/g)) return; 'ignore node_modules dir';
                                const cmd = exePath ? client.CommandList.get(require(requirePath).name) || {} : {};

                                if (stats.mtimeMs > (cmd.loadTime || 0) && (exePath || evtPath))
                                {
                                    const warnArray = [];

                                    if (exePath)
                                    {
                                        if ((cmd.memWeight || 0) === stats.size) return;
                                        if (resolve(requirePath) === cmd.resolvedPath) delete require.cache[resolve(requirePath)];
                                        CommandCheck(file, [], path, client, warnArray, { exe: [], unexec: 0, dev: 0 }, this.root);
                                        print_change(cmd, warnArray);
                                    }
                                    if (evtPath)
                                    {
                                        delete require.cache[resolve(requirePath)];
                                        EventCheck(file, path, client, { evt: [], unexec: 0, dev: 0, empty: 0 }, warnArray, this.root);
                                        process.env.HANDLED_EVENTS--;
                                        print_change(require(requirePath), warnArray);
                                    }
                                }
                                else client.Log.debug(`[Reload > ld] Updated: "${printCSLPath}"`);
                                timeout(requirePath);
                            }
                        }

                        'only scans utils/json folder';
                        if (file.endsWith('.json') && path.split('\\').some(n => n === 'json'))
                        {
                            // deal with CommandCategories
                            const object = require(requirePath);
                            object;
                            if (stats.mtimeMs > (object.lastUpdated || 0))
                            {
                                // do something here, or do we actually need to do it?
                            }
                        }
                    });
                }
                if (evt === 'rename')
                {
                    const warnArray = [];
                    try {
                        readFileSync(path);
                        if (file.endsWith('.js'))
                        {
                            if (exePath)
                            {
                                const cmd = client.CommandList.get(require(requirePath).name) || {};
                                CommandCheck(file, [], path, client, warnArray, { exe: [], unexec: 0, dev: 0 }, this.root);
                                client.Log.debug(`[Reload > ad] Registered ${cmd.name || `"${require(requirePath).name}" at` || 'something at'} ${printCSLPath}`);
                            }
                            if (evtPath)
                            {
                                EventCheck(file, path, client, { evt: [], unexec: 0, dev: 0, empty: 0 }, warnArray, this.root);
                                client.Log.debug(`[Reload > ad] Registered ${`"${require(requirePath).name || 'something'}" at`} ${printCSLPath}`);
                            }
                            if (warnArray.length) client.Log.warn(`[Executable Loader] ${client.Methods.Common.JoinArrayString(warnArray)}`);
                        }
                        else client.Log.debug(`[Reload > ad] Added "${printCSLPath}"`);
                    } catch (err) {
                        // ln 150: do something? [disable entry, etc etc...]
                        // if (cache(resolve(requirePath))) null;
                        handleErrors(err, requirePath);
                    } finally {
                        timeout(requirePath);
                    }
                }
            }
        });

        const handleErrors = (err, reqPath) => {
            if (!reqPath) return false;
            switch (err.code)
            {
                case 'ENOENT': return client.Log.debug(`[Reload > del] Removed: "${join(reqPath)}"`);
                case 'EISDIR': return;
                default: return client.Log.error(`[Reload / ${err.syscall}] ${err}`);
            }
        };

        const timeout = (pathName) => {
            FSEventTimeout.set(pathName, true);
            setTimeout(() => FSEventTimeout.delete(pathName), 500);
        };
    }
};
