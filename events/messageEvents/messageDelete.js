const guildActions = new (require('../../utils/Database/Methods/guildActions'));
const embeds = new (require('../../utils/embeds'));

module.exports =  {
	name: 'messageDelete',
	stable: true,
	onEmit: async (client, message) => {
		// We will just ignore DMs for now.
		if (message.channel.type === 'dm') return;

		// Get database...
		const data = await guildActions.guildGet(message.guild);
		if (data.MessageLogState && data.MessageLogChannel !== '')
		{
			const embed = embeds.messageLog(message);
			client.channels.cache.find(channel => channel.id === data.MessageLogChannel).send(embed.deleted);
		}

		if (message.embeds) message.content = message.embeds;

		const History = data.MessageLog;
		const LogHoldLimit = data.LogHoldLimit;

		let User = History.get(message.author.id);
		if (!User)
		{
			User = {
				tag: message.author.tag,
				nickname: message.member.nickname,
				id: message.author.id,
				deletedMessages: {},
			};
			History.set(User.id, User);
		}

		let DeletedHistory = User.deletedMessages;
		if (DeletedHistory === undefined) DeletedHistory = {};
		if (User.tag !== message.author.tag) User.tag !== message.author.tag;
		if (User.nickname !== message.member.nickname) User.nickname = message.member.nickname;

		const object = {
			dateID: `${Date.now()}`,
			user: message.author.tag,
			MsgContent: message.content,
			MsgTimestamp: message.createdAt,
		};
		DeletedHistory[object.dateID] = object;

		if (Object.keys(DeletedHistory).length > LogHoldLimit)
		{
			let array = [];
			const filteredArray = [];
			const tempObject = {};
			for (const key in DeletedHistory)
			{
				const ID = parseInt(key);
				array.push(ID);
				tempObject[ID] = DeletedHistory[key];
			}
			for (let i = 0; i < LogHoldLimit; i++)
			{
				const max = Math.max(...array);
				filteredArray.push(max);

				const newArray = array.splice(array.indexOf(max) - 1, 1);
				array = newArray;
			}

			filteredArray.sort();
			// Reset the object
			DeletedHistory = {};

			// Reassign the history object
			for (let i = 0; i < filteredArray.length; i++)
			{
				DeletedHistory[filteredArray[i]] = tempObject[filteredArray[i]];
			}
		}
		User.deletedMessages = DeletedHistory;

		History.set(User.id, User);
		guildActions.guildUpdate(message.guild, { MessageLog: History });
	},
};