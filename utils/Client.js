// Shorten stages of requiring
const { Loader, ParseCheck, IssueWarns } = require('./Loader');
const { error: outerr, carrier, bootstrap } = require('./Logger');
const http = require('http');
const ClientInit = require('./database/methods/client');

// Note: type 'ClientData' actually refers to <discord>#Client.
/**
 * Yes.
 */
module.exports = class Sayuri extends ClientInit {
    constructor(client, token)
    {
        const { App: app, bugChannel } = client;
        super(client);
        process.env.BUG_CHANNEL_ID = bugChannel || '630334027081056287';
        process.env.HANDLED_EVENTS = 0;

        console.clear();
        bootstrap();
        /** Initiates this client instance. */
        this.Init = () => {
            this.Login(client, token);
            this.EventListener(client);
            this.CommandInit(client);
            this.HandleProcessErrors();
            this.KeepAlive(app, true);
            this.Watch(client.ROOT_DIR, client);

            setTimeout(() => this.DBInit(), 3000);
        };
        this.DBInit = () => super.init(client);
    }

    /** Initiates a login session to Discord.
     * @param {ClientData} client The client to pass in.
     * @param {string} token The token of the client. Refer to [your app's page](https://discord.com/developers/applications) for more details.
    */
    Login(client, token)  {
        if (!client) throw new ReferenceError('[Sayuri > Client] Did you pass the client yet?');
        if (typeof client !== 'object') throw new TypeError('[Sayuri > Client] The client is not an object.');
        if (typeof token !== 'string') throw new TypeError('[Sayuri > Login] The token provided is not a string.');
        client.login(token);
    }

    /** Initiates the event listener.
     * @param {ClientData} client The client to pass in. */
    EventListener(client)
    {
        if (!client) throw new ReferenceError('[Sayuri > Client] Did you pass the client yet?');
        if (typeof client !== 'object') throw new TypeError('[Sayuri > Client] The client is not an object.');
        new Loader(client, ['events', 'evt']);
    }

    /** Loads the executables from the library.
     * @param {object} client The client to pass in. */
    CommandInit(client)
    {
        if (!client) throw new ReferenceError('[Sayuri > Client] Did you pass the client yet?');
        if (typeof client !== 'object') throw new TypeError('[Sayuri > Client] The client is not an object.');
        new Loader(client, ['executables', 'cmd']);
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

    /** Keep the app alive by pinging HTTP to the host in an interval. Not working as expected.
     * @param {} app
     * @param {boolean} thisHost
     */
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

    /** Watch for updates in directory and updates the client if needed.
     * Basically, hot-reloading, so you don't have to restart this everytime you make changes to core files. Hit save and keep working.
     *
     * @param {string} rootDir Root directory.
     * @param {ClientData} client The client to pass in.
     */
    Watch(rootDir, client)
    {
        const { watch, stat, readFileSync } = require('fs');
        const { join } = require('path');
        const FSEventTimeout = new Map();
        this.root = client.ROOT_DIR;

        watch(rootDir, { recursive: true }, (evt, filename) => {
            if (filename)
            {
                const path = join(this.root, filename);
                const printCSLPath = path.split('\\').splice(3, path.split('\\').length).join('\\');
                const { resolve } = require;
                const file = path.split('\\')[path.split('\\').length - 1];

                const print_change = (cmdOrEvt) => {
                    Object.keys(cmdOrEvt).length ?
                    client.Log.debug(`[Reload > ud] Updated ${cmdOrEvt.name || 'something at'} [${printCSLPath.split('\\').join(' > ')}]`) :
                    client.Log.debug(`[Reload > rg] Registered ${cmdOrEvt.name  || 'something at'} [${printCSLPath.split('\\').join(' > ')}]`);
                };

                const exePath = (path.match(/executables/g) || []).length ? true : false;
                const evtPath = (path.match(/events/g) || []).length ? true : false;

                if (evt === 'change')
                {
                    stat(filename, (e, stats) => {

                        // ln 124: this was probably a 'remove' event: requesting to merge with handlers below - call handleErrors()

                        if (e) client.Log.error(`[Reload - FileStats error] Path: ${path}\n${e.message}`);
                        if (!FSEventTimeout.get(path))
                        {
                            if (file.endsWith('.js'))
                            {
                                if (path.match(/node_modules/g)) return 'ignore node_modules dir';
                                if (path.match(/^(\.git)/g)) return 'ignore git dir';

                                let cmd;
                                try {
                                    cmd = exePath ? client.CommandList.get(require(path).name) || {} : {};
                                } catch (err) {
                                    cmd = {};
                                }

                                if (stats.mtimeMs > (cmd.loadTime || 0) && (exePath || evtPath))
                                {
                                    const data = { dirIndex: { invalidNames: [], emptyFiles: [], noFunc: [], errored: [] } };
                                    if (exePath)
                                    {
                                        if ((cmd.memWeight || 0) === stats.size) return;
                                        delete require.cache[resolve(path)];
                                        ParseCheck('cmd', path, client, data);
                                        print_change(cmd);
                                        IssueWarns(data.dirIndex, 'cmd');
                                    }
                                    if (evtPath)
                                    {
                                        delete require.cache[resolve(path)];
                                        ParseCheck('evt', path, client, data);
                                        process.env.HANDLED_EVENTS--;

                                        let obj;
                                        try {
                                            obj = require(path);
                                        }
                                        catch (err) { null; }

                                        print_change(obj || {});
                                        IssueWarns(data.dirIndex, 'evt');
                                    }
                                }
                                else client.Log.debug(`[Reload > ld] Updated: "${printCSLPath}"`);
                                timeout(path);
                            }

                            'only scans utils/json folder';
                            if (file.endsWith('.json') && path.split('\\').some(n => n === 'json'))
                            {
                                // deal with CommandCategories
                                const object = require(path);
                                object;
                                if (stats.mtimeMs > (object.lastUpdated || 0))
                                {
                                    // do something here, or do we actually need to do it?
                                }
                            }
                        }
                    });
                }
                if (evt === 'rename')
                {
                    const data = { dirIndex: { invalidNames: [], emptyFiles: [], noFunc: [], erroed: [] } };
                    try {
                        readFileSync(path);
                        if (file.endsWith('.js'))
                        {
                            if (exePath)
                            {
                                const cmd = client.CommandList.get(require(path).name) || {};
                                ParseCheck('cmd', path, client, data);
                                client.Log.debug(`[Reload > ad] Registered ${cmd.name  || 'something at'} ${printCSLPath}`);
                                IssueWarns(data.dirIndex, 'cmd');
                            }
                            if (evtPath)
                            {
                                ParseCheck('evt', path, client, data);
                                client.Log.debug(`[Reload > ad] Registered ${`"${require(path).name || 'something'}" at`} ${printCSLPath}`);
                                IssueWarns(data.dirIndex, 'evt');
                            }
                        }
                        else client.Log.debug(`[Reload > ad] Added "${printCSLPath}"`);
                    } catch (err) {
                        // ln 150: do something? [disable entry, etc etc...]
                        // if (cache(resolve(path))) null;
                        handleErrors(err, path);
                    } finally {
                        timeout(path);
                    }
                }
            }
        });

        const handleErrors = (err, reqPath) => {
            if (!reqPath) return false;
            const PrintCSLPath = reqPath.split('\\').splice(3, reqPath.split('\\').length).join('\\');
            switch (err.code)
            {
                case 'ENOENT': return client.Log.debug(`[Reload > del] Removed: "${join(PrintCSLPath)}"`);
                case 'EISDIR': return;
                default: return client.Log.error(`[Reload / ${err.syscall || err.name || 'Error'}] ${err}`);
            }
        };

        const timeout = (pathName) => {
            FSEventTimeout.set(pathName, true);
            setTimeout(() => FSEventTimeout.delete(pathName), 500);
        };
    }
};
