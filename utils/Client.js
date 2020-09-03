const Loader = require('./Loader');
const loader = new Loader;

// Shorten stage of requiring class
const log = new (require('./Logger'));

/**
 * Yes.
 */
module.exports = class Sayuri_Client {

    /**
     * Initiates a login session to Discord.
     * @param {object} client The client to pass in.
     * @param {string} token The token of the client. Refer to your app's page for more details.
     */
    login(client, token)  {
        if (!client) throw new ReferenceError('[Sayuri > Client] Did you pass the client yet?');
        if (typeof client !== 'object') throw new TypeError('[Sayuri > Client] The client is not an object.');
        if (typeof token !== 'string') throw new TypeError('[Sayuri > Login] The token provided is not a string.');
        client.login(token);
    }

    /**
     * Initiates the event listener.
     * @param {object} client The client to pass in.
     */
    eventListener(client)
    {
        if (!client) throw new ReferenceError('[Sayuri > Client] Did you pass the client yet?');
        if (typeof client !== 'object') throw new TypeError('[Sayuri > Client] The client is not an object.');
        loader.EventLoader('events', client, '../');
    }

    /**
     * Loads the executables from the library.
     * @param {object} client The client to pass in.
     */
    CommandInit(client)
    {
        if (!client) throw new ReferenceError('[Sayuri > Client] Did you pass the client yet?');
        if (typeof client !== 'object') throw new TypeError('[Sayuri > Client] The client is not an object.');
        loader.ExeLoader('executables', client, '../');
    }

    /** This is for handing some additional runtime errors. */
    handleProcessErrors()
    {
        process.on("uncaughtException", error => {
            log.error(`[Uncaught Exception] ${error.message}\n${error.stack}`);
            console.error(error);
        });
        process.on("unhandledRejection", error => {
            log.error(`[Unhandled Promise Rejection] ${error.message}\n${error.stack}`);
            console.error(error);
        });
    }
};