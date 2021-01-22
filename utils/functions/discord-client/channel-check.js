module.exports = function(channel)
{
	if (channel.type === 'dm') return 'In DM';
	const ch = {
		name: channel.name,
		id: channel.id,
		guild: channel.guild,
		nsfw: channel.nsfw,
	};
	return {
		info: ch,
		message: `In '${ch.name}' of [${ch.guild}] \`ID:${ch.id}\``,
	};

};