module.exports = {
	name: 'guildMemberAdd',
	stable: true,
	onEmit: async (client, member) => {
		const source = await client.GuildDatabase.get(member.guild);
		const { welcomeMessage, welcomeChannel } = source;

		if (member.id === client.id)
		{
			if (welcomeMessage === null && welcomeChannel === null)
			{
				client.guilds.fetch(member.guild)['newGuilld'] = true;
			}
			return;
		}

		if (welcomeChannel && welcomeMessage)
		{
			// Get user ...
			// Generate pictures [Renderers]
			// Send back
		}
	},
};