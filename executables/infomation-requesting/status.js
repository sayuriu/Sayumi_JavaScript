const { MessageEmbed: EmbedConstructor } = require('discord.js');
const clientSchema = require('../../utils/database/models/client');

const fixedMem = 2 * Math.pow(1024, 3);

module.exports = {
	name: 'status',
	aliases: ['stats'],
	group: ['Information'],
	description: 'Get information about my latency and memory usage.',
	cooldown: 12,
	onTrigger: async (message, client) => {

		const hex = client.Methods.Common.RandomHex8();
		const stringPad = client.Methods.Common.StringLimiter;
		const dbDL = await dbLatency(client);
		let processArrString = [
			`\`${stringPad('CPU:', '[Calculating...]', '.', 40)}\``,
			`\`${stringPad('Memory:', '[Calculating...]', '.', 40)}\``,
			`\`${stringPad('Heap:', '[Calculating...]', '.', 40)}\``,
			`\`${stringPad('C++:', '[Calculating...]', '.', 40)}\``,
		].join('\n');

		let latencyArrString = [
			`\`${stringPad('APIs:', '[Getting...]', '.', 24)}\``,
			`\`${stringPad('Message:', '[Getting...]', '.', 24)}\``,
			`\`${stringPad('Database:', '[Getting...]', '.', 24)}\``,
			`\`${stringPad('Internals:', '[Getting...]', '.', 24)}\``,
		].join('\n');

		const { hour, minute, second } = client.Methods.Time.TimestampToTime(Date.now() - client.uptime);

		message.channel.send(
			new EmbedConstructor()
				.setTitle('Status')
				.setDescription(`\`Uptime: ${hour > 0 ? `${hour} hr${hour > 1 ? 's' : ''} ` : ''}${minute > 0 ? `${minute} min${minute > 1 ? 's' : ''} ` : ''}${second > 0 ? `${second} sec${second > 1 ? 's' : ''}` : ''}\``)
				.addField('Process', processArrString, true)
				.addField('Latency', latencyArrString, true)
				.setColor('#f5f242')
				.setFooter(hex),
		).then(m => {

			const now = Date.now();
			const msgDL = now - m.createdTimestamp;

			latencyArrString = [
				`\`${stringPad('APIs:', `${client.ws.ping} ms`, '.', 24)}\``,
				`\`${stringPad('Message:', `${msgDL} ms`, '.', 24)}\``,
				`\`${stringPad('Database:', `${dbDL} ms`, '.', 24)}\``,
				`\`${stringPad('Internals:', `${thisLatency(client)} ms`, '.', 24)}\``,
			].join('\n');

			processArrString = [
				`\`${stringPad('CPU:', `${getCPU()}`, '.', 40)}\``,
				`\`${stringPad('Memory:', `${getMemoryUsage(client)}`, '.', 40)}\``,
				`\`${stringPad('Heap:', `${getHeap(client)}`, '.', 40)}\``,
				`\`${stringPad('C++:', `${getMemoryExternal(client)}`, '.', 40)}\``,
			].join('\n');

			while(Date.now() - now < 100);

			// what is inline
			m.edit(
				new EmbedConstructor()
				.setTitle('Status')
				.setDescription(`\`ProcessID [${hex}]\``)
				.addField('Uptime', `\`${hour > 0 ? `${hour} hr${hour > 1 ? 's' : ''} ` : ''}${minute > 0 ? `${minute} min${minute > 1 ? 's' : ''} ` : ''}${second > 0 ? `${second} sec${second > 1 ? 's' : ''}` : ''}\``)
				.addField('Handling', `\`${client.CommandList.size} command${client.CommandList.size > 1 ? 's' : ''}\``)
				.addField('Process', processArrString, true)
				.addField('Latency', latencyArrString, true)
				.setColor('#42b9f5')
				.setTimestamp(),
			);
		});
	},
};

function getCPU()
{
	const now = Date.now();
	const cpuATM = process.cpuUsage();
	while(Date.now() - now < 250);
	const cpuDiff = process.cpuUsage(cpuATM);
	const cpuNow = process.cpuUsage();

	const percentage = ((cpuDiff.user + cpuDiff.system) / (cpuNow.user + cpuNow.system) * 100).toFixed(2).split('.');
	let p;
	if (parseInt(percentage[0]) < 10) p = `0${percentage.join('.')}`;
	else p = percentage.join('.');
	return `${((cpuDiff.user + cpuDiff.system) / 10e5).toFixed(1)} > ${((cpuNow.user + cpuNow.system) / 10e5).toFixed(1)} | ${p}%`;
}

function getMemoryUsage(client)
{
	const rss = process.memoryUsage().rss;
	const percentage = (rss / fixedMem * 100).toFixed(2).split('.');
	let p;
	if (parseInt(percentage[0]) < 10) p = `0${percentage.join('.')}`;
	else p = percentage.join('.');

	return `${client.Methods.Data.ConvertBytes(rss)} of ${client.Methods.Data.ConvertBytes(fixedMem)} | ${p}%`;
}

function getMemoryExternal(client)
{
	const ext = process.memoryUsage().external;
	const fixedEMem = 100 * Math.pow(1024, 2);

	const percentage = (ext / fixedEMem * 100).toFixed(2).split('.');
	let p;
	if (parseInt(percentage[0]) < 10) p = `0${percentage.join('.')}`;
	else p = percentage.join('.');

	return `${client.Methods.Data.ConvertBytes(ext)} of ${client.Methods.Data.ConvertBytes(fixedEMem)} | ${p}%`;
}

function getHeap(client)
{
	const heapUsed = process.memoryUsage().heapUsed;
	const heapTotal = process.memoryUsage().heapTotal;
	const percentage = (heapUsed / heapTotal * 100).toFixed(2).split('.');
	let p;
	if (parseInt(percentage[0]) < 10) p = `0${percentage.join('.')}`;
	else p = percentage.join('.');

	return `${client.Methods.Data.ConvertBytes(heapUsed)} of ${client.Methods.Data.ConvertBytes(heapTotal)} | ${p}%`;
}

async function dbLatency(client)
{
	const startTime = process.hrtime();
	let diffTime = 0;

	try
	{
		await clientSchema.findOne({ readyTimestamp: client.readyTimestamp }).then(() => {
			diffTime = process.hrtime(startTime);
		});
	} catch (e) {
		return 'error';
	}

	return Math.round(diffTime[1] / 10000);
}

function thisLatency(client)
{
	const latencyIn = process.hrtime();
	let latencyOut = 0;

	client.on('a', () => {
		latencyOut = process.hrtime(latencyIn);
	});
	client.emit('a');
	return latencyOut[1] / 1000;
}