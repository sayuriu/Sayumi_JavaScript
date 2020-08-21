const Loader = require('./Loader');
const Function = require('./Functions');
const Embeds = require('./embeds');
const discord = require('discord.js');

const embeds = new Embeds;
const functions = new Function;
const loader = new Loader;
module.exports = class Sayuri_Client {
    login(client, token)  {
        client.login(token);
    }
    eventListener(client)
    {
        client.on('ready', () => {
            console.log('Status 200');
        });
        client.once('ready', () => {
            // const message = {
            //     channel: {
            //         id: '78943659384549323',
            //         name: 'uwu',
            //         nsfw: true,
            //         guild: 'Eli\'s a simp',
            //         type: 'dm',
            //     },
            //     author: {
            //         tag: 'Eli#1000',
            //         id: '454912325678399499',
            //     },
            // };
            // // const duration = '';
            // const reason = 'you share Eli';
            // const target = {
            //     tag: 'Sayuri#1222',
            //     id: '520964894279860224',
            // };
            // client.users.cache.find(users => users.id === '520964894279860224').send(Embeds.error(message, null));
            client.channels.cache.find(ch => ch.id === '731918444085379142').send(embeds.update('Info', 'Added `Framework.Loader` for basic command loads'));
            // functions.logger('inFo', 'LET\'S GOOOOOOOOOOOOOOOO');
        });
        loader.EventLoader(client);
    }
};