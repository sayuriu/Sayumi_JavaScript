const guildActions = require('../../utils/Database/Methods/guildActions');
const Functions = require('../../utils/Functions');
const Logger = require('../../utils/Logger');
const Embeds = new (require('../../utils/embeds'));
const responses = require('../../utils/responses.json');
const Guild = new guildActions;
const functions = new Functions;
const log = new Logger;
require('dotenv').config();
const { maid, master } = process.env;

module.exports = {
	name: 'message',
	stable: true,
	onEmit: async (client, message) => {
		// Get the info first.
		const source = await Guild.guildGet(message.guild);
		let prefix = source.prefix;
		const mention = `<@!${maid}>`;

		// She starts listening if the message starts with a prefix or a direct mention.
		if (message.content.startsWith(prefix) || message.content.startsWith(mention))
		{
			let mentionID = false;
			if (message.author.bot) return;
			if (message.content.startsWith(mention))
			{
				prefix = mention;
				mentionID = true;
			}

			// Returns when the message is sent in an appropriate channel
			if (!source.AllowedReplyOn.some(channelID => channelID === message.channel.id)) return;
			else
			{
				const args = message.content.slice(mentionID ? prefix.length + 1 : prefix.length).split(/ +/);
				const CommandName = args.shift().toLowerCase();

				// Look up for the command
				const RequestedCommand = client.CommandList.get(CommandName) ||
											client.CommandList.find(cmd => cmd.aliases && cmd.aliases.includes(CommandName));

				// If the command doesn't exist
				if (!RequestedCommand) {
					const typo = CommandName;
					const NotACmd = [
						"This is not a vaild command for me.",
						`Perhaps a typo, ${message.author}?`,
						"I can't issue this.",
						`Use \`${prefix}help\` for a help list if you are confused.`,
						`What is *${typo}*?`,
						`If that is an unadded feature, consider typing \`${source.prefix}feedback ${typo}\` if you want this feature/command added to my collection.`,
					];
					const res = functions.Randomized(NotACmd);
					if (source.FalseCMDReply === true) return message.channel.send(res);
					else return;
				}

				// Else....
				else
				{
					// If the command requires args... But the user doesn't includes many.
					if (RequestedCommand.args && !args.length)
					{
						// Eval command-explicit
						if (RequestedCommand.terminal) return message.channel.send('Terminal standing by.').then(m => m.delete(4000));
						// For normal commands
						else
						{
							let string;
							if (RequestedCommand.usage) string = `\nUsage: \`${prefix}${RequestedCommand.name} ${RequestedCommand.usage}\`.`;
							return message.channel.send(`${functions.Randomized(responses.commands.empty_arguments)}`);
						}
					}
					// Master-explicit commands
					if (RequestedCommand.master_explicit && message.author.id !== master) {
						return message.channel.send(`Sorry ${message.author}, but this command can be issued by my master only.`).then(msg => {
							if (message.channel.name.includes('general')) return msg.delete(4000);
							else return msg.delete(6000);
						});
					}

					// Try executing the command
					try {
						RequestedCommand.onTrigger(message, args, client);
					// Catch errors
					} catch (error) {
						log.error(`[Command Execution] An error has occured while executing "${RequestedCommand.name}": \n${error.message}`);
						client.channels.cache.find(ch => ch.id === '630334027081056287').send(Embeds.error(message, error.message));
						if (message.channel.type === 'text') return message.channel.send(functions.Randomized(responses.errors.command_errors));
						else return message.reply(functions.Randomized(responses.errors.command_errors));
					}
				}
			}
		}
		else return;
	},
};