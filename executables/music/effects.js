const { MessageEmbed: EmbedConstructor } = require('discord.js');

module.exports = {
	name: 'effects',
	aliases: ['fx'],
	description: '',
	group: ['Music'],
	cooldown: 2,
	onTrigger: (message, args, client) => {

		if (!args.length)
		{
			return;
		}
		const cmd = args[0];
		args.shift();
		new EffectsUtil(message, cmd, args);
	},
};

class EffectsUtil
{
	constructor(message, cmd, ...args)
	{
		this.client = message.client;
		this.ListenerChannel = message.channel;
		this.Guild = message.guild;
		if (cmd)
		{
			if (Object.keys(this).includes(cmd)) return this[cmd](args);
			return this.enable(args);
		}
	}

	// util
	list(args, type = 'all')
	{
		if (type === 'guild')
		{
			// do guilds
		}
		return 'do all';
	}

	set(args)
	{

	}

	add(args)
	{

	}

	edit(args)
	{

	}

	remove(args)
	{
		// if core do not remove;
	}

	// change status
	enable(args)
	{
		const [name] = args;

	}

	disable(args)
	{

	}


	// aliases
	guild(args)
	{
		return this.list(args, 'guild');
	}
	define(args)
	{
		const [name] = args;
		const guildCustomFilter = this.client.Database.Guild.loadFromCache(this.Guild.id);
		const player = this.client.MusicPlayer;
		const filterList = [].concat(Object.keys(player.filters), guildCustomFilter);

		if (filterList.includes(name.toLowerCase())) return this.edit(args);
		return this.add(args);
	}
	off(args)
	{
		return this.disable(args);
	}
}

/**
 * main, List:string options
 *
 * /fx list [+ guild] | guild? -- alias 'guild'
 * /fx off [...effectName? | all]
 *
 * /fx enable [...effectNames]
 * /fx [...effectNames] --alias 'enable'
 *
 * /fx effectName <immediateValue>
 * 	   --side trigger? Command('define')
 *
 * #Command:Scopes --affect 'guild_only'
 *
 * /fx guild --alias 'list' --show 'fx-guild'
 *
 * /fx define <effectName, effect>
 * 	  case     effectName: --alias 'edit'
 * 	  case not effectName: --alias 'add'
 *
 * /fx add effectName, <effect>
 * /fx edit effectName, <values>
 * /fx remove <effectName>
*/

/** strategy
 * update: get, update, clear, change
*/