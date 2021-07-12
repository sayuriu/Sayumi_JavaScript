module.exports = {
	name: 'databaseUpdate',
	onEmit: (client, type, data) => {
		if (type === 'guild') return HandleGuildData(client, data);
	},
};

function HandleGuildData(client, data)
{
	client.CachedGuildSettings.set(data.guildID, data);
}