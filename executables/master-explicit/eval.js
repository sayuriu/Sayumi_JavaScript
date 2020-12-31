const beautify = require('beautify');
const util = require('util');
const fs = require('fs');
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
		const filter = (reaction, user) => {
			return ['👍', '✋'].includes(reaction.emoji.name) && user.id === message.author.id;
		};
		const userFilter = user => user.id === message.author.id;
		const session = new EvalRenderer(Object.assign(message, { ReactionFilter: filter, UserFilter: userFilter, sessionID: sessionID }), prefix);

		const sessionID = getSessionsID(message.author, message.channel);
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

	constructor(message, prefix)
	{
		this.header = null;
		this.message = message;
		this.mainInstanceUserID = message.author.id;
		this.InstanceID = message.sessionID;
		this.listenerChannel = message.channel;
		this.showHidden = false;
		this.showExt = false;
		this.destroyed = false;
		this.exceedBoolean = false;
		this.OutputWindows = [];
		this.flagArray = [];
		this.input = message.content.slice(prefix.length + 5);
		this.ReactionFilter = message.ReactionFilter;
		this.UserFilter = message.UserFilter;
		this._embed = null;
		this.lastInput = null;
		// this.emptyInputStart = false;
		this.prefix = prefix;

		this.a = -1;
		this.sessionActiveString = `\`\`\`css\n${headerStringArray.join('\n')
				.replace(/\n/g, () => {
					this.a++;
					if (this.a === 0) return '\n';
					return `\n0${this.a} `;
				})
				.replace(/\${SID}/g, this.InstanceID)}\`\`\``;
		this.sessionDestroyedString = '```\nThis session is destroyed. No input will be taken until you start a new one.```';
	}


	start()
	{
		this.message.delete();
		if (GeneralProcessing.processInput(this.input).input.replace(/\s+/g, '') === '') this.resetUI('<Awaiting input...>');
		else
		{
			this.updateEvalState();
			this.generateEmbeds();
		}

		if (this._embed instanceof EmbedConstructor)
		{
			this.listenerChannel.send(this.sessionActiveString).then(m => this.header = m);
			this.listenerChannel.send(this._embed).then(mainEmbed => {

				if (this.error) this.error = GeneralProcessing.ErrorExport(this.error);

				if (this.showExt) this.listenerChannel.send(`\`\`\`js\n${this.output ? this.output : this.error}\`\`\`\u200b\`${this.outputType}\``).then(m => this.OutputWindows.push(m));
				if (this.exceedBoolean && this.filePath) this.listenerChannel.send(new MessageAttachment(fs.readFileSync(this.filePath), `eval.json`)).then(m => {
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

				this.resetEvalState();
				this.clearWindows();
				this.input = this.lastInput.first().content;

				if (this.message.author.id !== this.message.client.master)
				{
					if (
						this.input.toLowerCase().match(/this.message.client.token/g) ||
						this.input.toLowerCase().match(/process.env/g)
					) this.resetUI('<no-exe: Input contain illegal keywords');
				}

				if (this.input.startsWith(this.prefix))
				{
					const data = {
						input: this.input,
						error: {
							name: 'CONFLICTED_HEADER',
							message: 'Input started with this bot\'s prefix.',
						},
					};
					this._embed = new TerminalEmbeds(data).ReturnError();
				}
				else
				{
					if (this.input.toLowerCase().startsWith('-exit')) return this.destroyInstance();

					this.updateEvalState();
					this.generateEmbeds();
					this.updateMainInstance();
				}

				if (this.error) this.error = GeneralProcessing.ErrorExport(this.error);
				if (this.showExt) this.listenerChannel.send(`\`\`\`js\n${this.output ? this.output : this.error}\`\`\`\u200b\`${this.outputType}\``).then(m => this.OutputWindows.push(m));
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
						this.listenerChannel.send(new MessageAttachment(fs.readFileSync(this.filePath), `eval.json`)).then(m => {
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
		if (this.error) this._embed = new TerminalEmbeds(this).ReturnError();
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

	updateEvalState()
	{
		Object.assign(this, GeneralProcessing.processInput(this.input, this.message));
		Object.assign(this, GeneralProcessing.execute(this.input, this.showHidden));
		GeneralProcessing.outputCheck(this.message, this);
	}

	resetEvalState()
	{
		this.output = null;
		this.outputRaw = null;
		this.outputType = null;
		this.error = null;
		this.showHidden = false;
		this.showExt = false;
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
	static processInput(input, message)
	{
		this.message = message;
		let showHidden = false;
		let showExt = false;
		const flagArray = [];

		const flag_showHidden = input.match(/\s*-(showHidden|showhidden|sh|SH)\s*/);
		const flag_showExt = input.match(/\s*-(ext|showExt)\s*/);
		// const flag_active = input.match(/\s*-active\s*/);

		if (flag_showHidden && flag_showHidden[0].length > 0)
		{
			input = input.replace(/\s*-?(showHidden|showhidden|sh|SH)\s*/, '');
			showHidden = true;
			flagArray.push('showHidden');
		}
		if (flag_showExt && flag_showExt[0].length > 0)
		{
			input = input.replace(/\s*-?(ext|showExt)\s*/, '');
			showExt = true;
			flagArray.push('showExtended');
		}

		input = input.replace(/^`+(js)?/, '').replace(/`+$/, '');
		return { input: input, showHidden: showHidden, showExt: showExt, flagArray: flagArray };
	}

	static execute(input, showHidden)
	{
		try
		{
			const processed = eval(input);
			const output = util.inspect(processed, showHidden, null, false);
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

			return { diffTime: diffTime, output: output, outputType: outputType, outputRaw: processed, error: null };
		}
		catch (error)
		{
			return {
				diffTime: 0,
				output: null,
				outputType: 'error',
				error: {
					name: error.name,
					stack: error.stack.substr(error.stack.indexOf('at '), error.stack.length),
					message: error.message,
				},
			};
		}
	}

	static outputCheck(message, data)
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
					if (data.showExt && JSONObjectString.length <= 2048) data.output = util.inspect(JSON.parse(JSONObjectString), false, null, false);
					else if (JSONObjectString.length <= 1024) data.output = util.inspect(JSON.parse(JSONObjectString), false, null, false);
					data.exceedBoolean = true;

					this.DataExport(Object.assign(
							data,
							{ fileName: `${message.author.id}-${message.createdTimestamp}.json` },
							{ writeData: JSONObjectString },
					));
				}
				else
				{
					data.showExt = true;
					this.DataExport(data, data.showExt);
				}

			} catch (e) {
				data.showExt = true;
				this.DataExport(data, data.showExt);
			}
		}
	}

	static DataExport(data, showExt = false)
	{
		const { fileName = null, writeData = null } = data;
		if (fileName && writeData)
		{
			fs.writeFileSync(`./temps/${fileName}`, writeData);
			data.filePath = `./temps/${fileName}`;
		}
		data.output = data.output.substr(0, data.output.substr(0, showExt ? 1956 : 1010).lastIndexOf('\n')) + '\n...';
	}

	static ErrorExport(error)
	{
		error.stack = 'Hidden';
		return util.inspect(JSON.parse(JSON.stringify(error, null, 4)), false, null, false);
	}
}

class TerminalEmbeds
{
	constructor(data)
	{
		this.input = data.input;
		this.flagArray = data.flagArray;
		this.showExt = data.showExt;
		this.output = data.output;
		this.outputType = data.outputType;
		this.diffTime = data.diffTime;
		this.error = data.error;
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
