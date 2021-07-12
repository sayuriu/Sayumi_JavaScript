module.exports = {
	name: 'guildMemberAdd',
	onEmit: async (client, member) => {
		const source = await client.Database.Guild.get(member.guild);
		const { welcomeMessage, welcomeChannel } = source;

		if (member.id === client.id)
		{
			if (!welcomeMessage && !welcomeChannel)
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