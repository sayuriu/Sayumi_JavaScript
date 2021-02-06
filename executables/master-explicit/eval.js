const beautify = require('beautify');
const { inspect } = require('util');
const { readFileSync, writeFileSync } = require('fs');
const { MessageEmbed: EmbedConstructor, MessageAttachment } = require('discord.js');

module.exports = {
	name: 'eval',
	description: 'Execute literally anything, directly through the command line. \nSounds scary.',
	cooldown: 0,
	stable: true,
	args: true,
	group: 'Utilities',
	terminal: true,
	master_explicit: true,
	usage: '[flags] <input>',
	usageSyntax: '[flags: ]',
	onTrigger: async (message, prefix, client) => {
		const sessionID = getSessionsID(message.author, message.channel);

		const session = new EvalRenderer(Object.assign(message, {
			ReactionFilter: (reaction, user) => ['👍', '✋'].includes(reaction.emoji.name) && user.id === message.author.id,
			UserFilter: user => user.id === message.author.id,
			sessionID: sessionID,
			prefix: prefix,
		}));

		client.EvaluatingSessions.set(sessionID, session);
		client.EvaluatingSessions.get(sessionID).start();
	},
};
const headerStringArray = [
	'--------- [EVAL SESSION ACTIVE] \'${SID}\'',
	'',
	' - Type in expressions directly to execute.',
	' - Flags can be included before the expression: [sh/ext/]',
	' - Type -exit to cancel this session.',
	' [NOTE: \'You cannot execute commands in the same channel until this session ends.\']',
];
const getSessionsID = (user, channel) => (parseInt(user.id) + parseInt(channel.id)).toString(16);

class EvalRenderer {

	constructor(message)
	{
		this.header = null;
		this.message = message;
		this.mainInstanceUserID = message.author.id;
		this.InstanceID = message.sessionID;
		this.listenerChannel = message.channel;
		this.destroyed = false;
		this.exceedBoolean = false;
		this.OutputWindows = [];
		this.input = message.content.slice(message.prefix.length + 5);
		this.ReactionFilter = message.ReactionFilter;
		this.UserFilter = message.UserFilter;
		this._embed = null;
		this.lastInput = null;
		this.prefix = message.prefix;

		this.a = -1;
		this.sessionActiveString = `\`\`\`css\n${headerStringArray.join('\n')
				.replace(/\n/g, () => {
					this.a++;
					if (this.a === 0) return '\n';
					return `\n0${this.a} `;
				})
				.replace(/\${SID}/g, '0x' + this.InstanceID)}\`\`\``;
		this.sessionDestroyedString = '```\nThis session is destroyed. No input will be taken until you start a new one.```';
	}


	start()
	{
		this.message.delete();
		this.updateState();

		if (this.input.replace(/\s+/g, '') === '') this.resetUI('<Awaiting input...>');
		else this.generateEmbeds();

		if (this._embed instanceof EmbedConstructor)
		{
			this.listenerChannel.send(this.sessionActiveString).then(m => this.header = m);
			this.listenerChannel.send(this._embed).then(mainEmbed => {

				if (this.flagArray.some(f => f === 'showExtended')) this.listenerChannel.send(`\`\`\`js\n${this.output}\`\`\`\u200b\`${this.outputType}\``).then(m => this.OutputWindows.push(m));
				if (this.exceedBoolean && this.filePath) this.listenerChannel.send(new MessageAttachment(readFileSync(this.filePath), `eval.json`)).then(m => {
					this.OutputWindows.push(m);
					this.exceedBoolean = false;
				});

				this.mainEmbedInstance = mainEmbed;
				this.listener();
			});
		}
	}

	// Main listener of this instance
	async listener()
	{
		if (this.destroyed) return;
		if (this.mainEmbedInstance.deleted) return;
		this.lastInput = await this.listenerChannel.awaitMessages(m => m.author.id === this.mainInstanceUserID, { max: 1, time: 2147483646, errors: ['time'] }).catch(async error => {
			return await this.listener();
		});
		if (this.lastInput.first())
			{
				this.message = this.lastInput.first();
				this.lastInput.first().delete();

				this.resetState();
				this.clearWindows();
				this.input = this.lastInput.first().content;

				if (this.input.toLowerCase().startsWith('-exit')) return this.destroyInstance();

				this.updateState();
				this.generateEmbeds();
				this.updateMainInstance();

				if (this.flagArray.some(f => f === 'showExtended')) this.listenerChannel.send(`\`\`\`js\n${this.output}\`\`\`\u200b\`${this.outputType}\``).then(m => this.OutputWindows.push(m));
				if (this.exceedBoolean && this.filePath)
				{
					if (!this.listenerChannel.permissionsFor(this.message.client.user.id).has('ATTACH_FILES'))
					{
						const desc = this._embed.description ? this._embed.description + '\n' : '';
						this._embed = new EmbedConstructor(Object.assign(
							this._embed,
							{ description: `${desc}'Couldn't send output file. Lacking permission.'` },
						));
					}
					else
					{
						this.listenerChannel.send(new MessageAttachment(readFileSync(this.filePath), `eval.json`)).then(m => {
							this.OutputWindows.push(m);
							this.exceedBoolean = false;
						});
					}
				}
				await this.listener();
			}
		else return await this.listener();
	}

	// Update on each pull
	updateMainInstance()
	{
		if (this.mainEmbedInstance && this._embed) this.mainEmbedInstance.edit(this._embed);
	}

	generateEmbeds()
	{
		if (this.outputType === 'error') this._embed = new TerminalEmbeds(this).ReturnError();
		else this._embed = new TerminalEmbeds(this).ReturnSucess();
	}

	clearWindows()
	{
		this.OutputWindows.forEach(inst => {
			if (inst.deleted) return;
			inst.delete();
			this.OutputWindows.splice(inst.index, 1);
		});
	}

	updateState()
	{
		const data = {
			message: this.message,
			prefix: this.prefix,
			rawInput: this.input,
		};
		Object.assign(this, new GeneralProcessing(data));
	}

	resetState()
	{
		this.output = null;
		this.outputRaw = null;
		this.outputType = null;
		this.flagArray = [];
		this.diffTime = 0;
		this._embed = 0;
	}

	destroyInstance()
	{
		this.header.edit(this.sessionDestroyedString);
		this.resetUI('<destroyed session>');
		this.updateMainInstance();
		if (this.message.content.match(/\s(-%del|-%d)\s*/))
		{
			this.mainEmbedInstance.delete({ timeout: 5000 });
			this.header.delete({ timeout: 5000 });
		}
		this.message.client.EvaluatingSessions.delete(getSessionsID(this.message.author, this.message.channel));
		return this.destroyed = true;
	}

	resetUI(message)
	{
		this._embed = new EmbedConstructor()
							.setTitle('Terminal')
							.setColor('#bdbdbd')
							.addField('\u200b', `\`\`\`\n${message}\`\`\``);
	}
}

class GeneralProcessing
{
	constructor(data)
	{
		this.message = data.message;
		this.prefix = data.prefix;
		this.rawInput = data.rawInput;
		this.flagArray = [];
		this.run();
	}

	run()
	{
		this.input = this.processInput(this.rawInput);
		Object.assign(this, this.execute(this.input, this.flagArray, this.message, this.message.client, console.log));
		this.outputCheck(this.message, this);
		this.output = this.ErrorExport(this.output);
	}

	processInput(rawInput)
	{
		let input =  rawInput;
		const flag_showHidden = input.match(/\s*-(showHidden|showhidden|sh|SH)\s*/);
		const flag_showExt = input.match(/\s*-(ext|showExt)\s*/);

		if (flag_showHidden && flag_showHidden[0].length > 0)
		{
			input = input.replace(/\s*-?(showHidden|showhidden|sh|SH)\s*/, '');
			this.flagArray.push('showHidden');
		}
		if (flag_showExt && flag_showExt[0].length > 0)
		{
			input = input.replace(/\s*-?(ext|showExt)\s*/, '');
			this.flagArray.push('showExtended');
		}

		input = input.replace(/^`+(js)?/, '').replace(/`+$/, '');
		return input;
	}

	execute(input, flagArray, message, client, log)
	{
		try
		{
			if (illegalStrings(this.input.toLowerCase()))this.GenerateErrors('FORBIDDEN', 'Illegal keywords / varibles found.');
			if (input.startsWith(this.prefix)) this.GenerateErrors('CONFLICTED_HEADER', 'Input started with this bot\'s prefix.');

			const showHidden = flagArray.some(f => f === 'showHidden');

			// this.parse(input);

			const processed = eval(input);
			const output = inspect(processed, showHidden, null, false);
			const startTime = process.hrtime();
			const diffTime = process.hrtime(startTime);
			let outputType = (typeof processed).toString();

			if (outputType === 'undefined') outputType = 'statement';
			outputType = outputType.replace(outputType.substr(0, 1), outputType.substr(0, 1).toUpperCase());

			if (output.indexOf('{') > -1 && output.endsWith('}'))
			{
				const header = output.substr(0, output.indexOf('{') - 1);
				if (header.toLowerCase().includes(outputType.toLowerCase()))
				{
					outputType = `[${header}]`;
					outputType = outputType.replace(/^\[+/, '').replace(/]+$/, '');
				}
				else outputType += `: ${header}`;
			}

			return { diffTime: diffTime, output: output, outputType: outputType, outputRaw: processed };
		}
		catch (error)
		{
			return {
				diffTime: 0,
				output: {
					name: error.name,
					stack: error.stack.substr(error.stack.indexOf('at '), error.stack.length),
					message: error.message,
				},
				outputType: 'error',
				outputRaw: null,
			};
		}
	}

	outputCheck(message, data)
	{
		if (data.error) return;
		if (data.output.length > 1024)
		{
			let JSONObjectString = '';
			try
			{
				JSONObjectString = JSON.stringify(data.outputRaw, null, 4);
				if (JSONObjectString)
				{
					if (data.flagArray.some(f => f === 'showExtended') && JSONObjectString.length <= 2048) data.output = inspect(JSON.parse(JSONObjectString), false, null, false);
					else if (JSONObjectString.length <= 1024) data.output = inspect(JSON.parse(JSONObjectString), false, null, false);
					data.exceedBoolean = true;

					this.DataExport(Object.assign(
							data,
							{ fileName: `${message.author.id}-${message.createdTimestamp}.json` },
							{ writeData: JSONObjectString },
					));
				}
				else
				{
					data.flagArray.push('showExtended');
					this.DataExport(data, data.showExt);
				}

			} catch (e) {
				data.flagArray.push('showExtended');
				this.DataExport(data, data.showExt);
			}
		}
	}

	DataExport(data, showExt = false)
	{
		const { fileName = null, writeData = null } = data;
		if (fileName && writeData)
		{
			writeFileSync(`./temps/${fileName}`, writeData);
			data.filePath = `./temps/${fileName}`;
		}
		data.output = data.output.substr(0, data.output.substr(0, showExt ? 1956 : 1010).lastIndexOf('\n')) + '\n...';
	}

	ErrorExport(data = null)
	{
		if (data.type !== 'error') return data;
		data.stack = 'Hidden';
		return inspect(JSON.parse(JSON.stringify(data, null, 4)), false, null, false);
	}

	GenerateErrors(name, message)
	{
		class BaseError extends Error {
			constructor(header, ...msg)
			{
				super(...msg);
				this.name = header || 'UNKNOWN_ERROR';
				this.name = this.name.toUpperCase();

				Error.captureStackTrace(this, BaseError);
			}
		}
		throw new BaseError(name, message);
	}
}

class TerminalEmbeds
{
	constructor(data)
	{
		this.input = data.input;
		this.flagArray = data.flagArray;
		this.showExt = data.flagArray.some(f => f === 'showExtended');
		this.output = data.output;
		this.outputType = data.outputType;
		this.diffTime = data.diffTime;
		this.error = data.outputType === 'error' ? data.output : null;
		this.exceedBoolean = data.exceedBoolean;
		this.filePath = data.filePath || null;
	}
	ReturnSucess()
	{
		const flagArray = this.flagArray,
				showExt = this.showExt,
				output = this.output,
				outputType = this.outputType,
				diffTime = this.diffTime;

		return new EmbedConstructor()
				.setTitle('Terminal')
				.setColor('#5acc61')
				.addField('Input', `${flagArray.length > 0 ? `\`flags: ${flagArray.join(', ')}\`\n` : ''}\`\`\`js\n${beautify(this.input, { format: 'js' })}\n\`\`\``)
				.addField('Output', `\`\`\`js\n${showExt ? 'The output is shown below.' : output.length > 1010 ? output.substr(0, output.substr(0, 1010).lastIndexOf('\n')) + '\n...' : output}\n\`\`\``)

				.setFooter(`${showExt ? `Executed in ${diffTime[0] > 0 ? `${diffTime}s` : ""}${diffTime[1] / 1000000}ms` : `[${outputType}] | Executed in ${diffTime[0] > 0 ? `${diffTime}s` : ""}${diffTime[1] / 1000000}ms`}`)
				.setTimestamp();
	}

	ReturnError()
	{
		const errorName = this.error.name;
		const message = this.error.message;

		return new EmbedConstructor()
				.setTitle('Terminal')
				.setColor('#fa3628')

				.addField('Input', `\`\`\`js\n${beautify(this.input, { format: 'js' })}\n\`\`\``)
				.addField('Error', `\`[${errorName}] ${message}\``)

				.setTimestamp();
	}
}

function illegalStrings(input) {
	const match = reg => input.match(reg);
	switch (input)
	{
		case match(/(this\.)?message\.client\.token/g): return true;
		case match(/process.env/): return true;
		default: return false;
	}
}