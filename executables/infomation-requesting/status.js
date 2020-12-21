const { MessageEmbed: EmbedConstructor } = require('discord.js');
const clientSchema = require('../../utils/Database/Models/client');

const fixedMem = 2 * Math.pow(1024, 3);

module.exports = {
	name: 'status',
	aliases: ['stats'],
	group: ['Information'],
	description: 'Get information about my latency and memory usage.',
	cooldown: 12,
	onTrigger: async (message, args, client) => {

		const hex = client.Methods.randomHex8();
		const dbDL = await dbLatency(client);
		let processArr = [
			`\`${client.Methods.stringLimiter('CPU:', '[Calculating...]', null, 40)}\``,
			`\`${client.Methods.stringLimiter('Memory:', '[Calculating...]', null, 40)}\``,
			`\`${client.Methods.stringLimiter('Heap:', '[Calculating...]', null, 40)}\``,
			`\`${client.Methods.stringLimiter('C++:', '[Calculating...]', null, 40)}\``,
		];
		let processArrString = processArr.join('\n');

		let latencyArr = [
			`\`${client.Methods.stringLimiter('APIs:', '[Getting...]', null, 24)}\``,
			`\`${client.Methods.stringLimiter('Message:', '[Getting...]', null, 24)}\``,
			`\`${client.Methods.stringLimiter('Database:', '[Getting...]', null, 24)}\``,
			`\`${client.Methods.stringLimiter('Internals:', '[Getting...]', null, 24)}\``,
		];
		let latencyArrString = latencyArr.join('\n');

		const { hour, minute, second } = client.Methods.TimestampToTime(Date.now() - client.uptime);

		// const eve

		const initEmbed = new EmbedConstructor()
				.setTitle('Status')
				.setDescription(`\`Uptime: ${hour > 0 ? `${hour} hr${hour > 1 ? 's' : ''} ` : ''}${minute > 0 ? `${minute} min${minute > 1 ? 's' : ''} ` : ''}${second > 0 ? `${second} sec${second > 1 ? 's' : ''}` : ''}\``)
				.addField('Process', processArrString, true)
				.addField('Latency', latencyArrString, true)
				.setColor('#f5f242')
				.setFooter(hex);

		message.channel.send(initEmbed).then(m => {

			const now = Date.now();
			const msgDL = now - m.createdTimestamp;

			latencyArr = [
				`\`${client.Methods.stringLimiter('APIs:', `${client.ws.ping} ms`, null, 24)}\``,
				`\`${client.Methods.stringLimiter('Message:', `${msgDL} ms`, null, 24)}\``,
				`\`${client.Methods.stringLimiter('Database:', `${dbDL} ms`, null, 24)}\``,
				`\`${client.Methods.stringLimiter('Internals:', `${thisLatency(client)} ms`, null, 24)}\``,
			];
			latencyArrString = latencyArr.join('\n');

			processArr = [
				`\`${client.Methods.stringLimiter('CPU:', `${getCPU()}`, null, 40)}\``,
				`\`${client.Methods.stringLimiter('Memory:', `${getMemoryUsage(client)}`, null, 40)}\``,
				`\`${client.Methods.stringLimiter('Heap:', `${getHeap(client)}`, null, 40)}\``,
				`\`${client.Methods.stringLimiter('C++:', `${getMemoryExternal(client)}`, null, 40)}\``,
			];
			processArrString = processArr.join('\n');

			while(Date.now() - now < 100);

			const updatedEmbed = new EmbedConstructor()
				.setTitle('Status')
				.setDescription(`\`ProcessID [${hex}]\``)
				.addField('Uptime', `\`Uptime: ${hour > 0 ? `${hour} hr${hour > 1 ? 's' : ''} ` : ''}${minute > 0 ? `${minute} min${minute > 1 ? 's' : ''} ` : ''}${second > 0 ? `${second} sec${second > 1 ? 's' : ''}` : ''}\``)
				.addField('Handling', `\`${client.CommandList.size}\``, true)
				.addField('Process', processArrString)
				.addField('Latency', latencyArrString, true)
				.setColor('#42b9f5')
				.setTimestamp();

			m.edit(updatedEmbed);
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

	return `${client.Methods.convertBytes(rss)} of ${client.Methods.convertBytes(fixedMem)} | ${p}%`;
}

function getMemoryExternal(client)
{
	const ext = process.memoryUsage().external;
	const fixedEMem = 100 * Math.pow(1024, 2);

	const percentage = (ext / fixedEMem * 100).toFixed(2).split('.');
	let p;
	if (parseInt(percentage[0]) < 10) p = `0${percentage.join('.')}`;
	else p = percentage.join('.');

	return `${client.Methods.convertBytes(ext)} of ${client.Methods.convertBytes(fixedEMem)} | ${p}%`;
}

function getHeap(client)
{
	const heapUsed = process.memoryUsage().heapUsed;
	const heapTotal = process.memoryUsage().heapTotal;
	const percentage = (heapUsed / heapTotal * 100).toFixed(2).split('.');
	let p;
	if (parseInt(percentage[0]) < 10) p = `0${percentage.join('.')}`;
	else p = percentage.join('.');

	return `${client.Methods.convertBytes(heapUsed)} of ${client.Methods.convertBytes(heapTotal)} | ${p}%`;
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