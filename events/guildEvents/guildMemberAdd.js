module.exports = {
	name: 'guildMemberAdd',
	stable: true,
	onEmit: async (client, member) => {
		const source = await client.GuildDatabase.get(member.guild);
		const { welcomeMessage, welcomeChannel } = source;

		if (member.id === client.id)
		{
			// side code
			return;
		}

		if (welcomeChannel && welcomeMessage)
		{
			//
		}
	},
};