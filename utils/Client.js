// Shorten stage of requiring class
const loader = require('./Loader');
const log = require('./Logger');
const http = require('http');
const Init = require('./Database/Methods/client');

/**
 * Yes.
 */
module.exports = class Sayuri extends Init {
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

            process.env.BUG_CHANNEL_ID = data.bugChannel || '630334027081056287';

            setTimeout(() => this.DBInit(), 3000);
        };
        this.Refresh = () => this.Reload(client);
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
        const request = { type: 'events', client: client, root: '../' };
        new loader(request).LoadEvents();
    }

    /**
     * Loads the executables from the library.
     * @param {object} client The client to pass in.
     */
    CommandInit(client)
    {
        if (!client) throw new ReferenceError('[Sayuri > Client] Did you pass the client yet?');
        if (typeof client !== 'object') throw new TypeError('[Sayuri > Client] The client is not an object.');
        const request = { type: 'executables', client: client, root: '../' };
        new loader(request).LoadCommands();
    }

    /** This is for handling some additional runtime errors and events. */
    HandleProcessErrors()
    {
        process.on("uncaughtException", error => {
            log.error(`[Uncaught Exception] ${error.message}\n${error.stack}`);
        });
        process.on("unhandledRejection", error => {
            log.error(`[Unhandled Promise Rejection] ${error.message}\n${error.stack}`);
        });
        process.on('exit', code => {
            log.carrier(`status: ${code}`, `Process instance has exited with code ${code}.`);
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

    static Reload(client)
    {
        const request = { type: 'executables', client: client, root: '../' };
        return new loader(request).LoadCommands();
    }
};