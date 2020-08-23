const Loader = require('./Loader');
const loader = new Loader;

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
        if (!client) throw new Error('[Sayuri > Client] Did you pass the client yet?');
        if (typeof client !== 'object') throw new Error('[Sayuri > Client] The client is not an object.');
        if (typeof token !== 'string') throw new Error('[Sayuri > Login] The token provided is not a string.');
        client.login(token);
    }

    /**
     * Initiates the event listener.
     * @param {object} client The client to pass in.
     */
    eventListener(client)
    {
        if (!client) throw new Error('[Sayuri > Client] Did you pass the client yet?');
        if (typeof client !== 'object') throw new Error('[Sayuri > Client] The client is not an object.');
        loader.EventLoader('events', client, '../');
    }

    /**
     * Loads the executables from the library.
     * @param {object} client The client to pass in.
     */
    CommandInit(client)
    {
        if (!client) throw new Error('[Sayuri > Client] Did you pass the client yet?');
        if (typeof client !== 'object') throw new Error('[Sayuri > Client] The client is not an object.');
        loader.ExeLoader('executables', client, '../');
    }
};