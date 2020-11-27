const { MessageEmbed: EmbedConstructor, MessageAttachment } = require('discord.js');

module.exports = {
	name: 'messageDelete',
	stable: true,
	onEmit: async (client, message) => {

		if (message.channel.type === 'dm') return;

		const data = await client.GuildDatabase.get(message.guild);

		const LogChannel = message.guild.channels.cache.find(ch => ch.id === data.MessageLogChannel);
		if (data.MessageLogState && LogChannel)
		{
			let hasBeenEditedBefore = null;
			// Edits the existing embed
			LogChannel.messages.fetch({ limit: 100 }, false, true).then(async result => {
				const target = result.find(msg => msg.editedFlag && msg.editedFlag === message.id);
				if (!target) return send();

				const needsToBeEdited = target.embeds[0].fields.find(field => field.name === 'Edited');
				if (!needsToBeEdited) return send();
				needsToBeEdited.value = `~~${needsToBeEdited.value}~~`;

				await target.edit(new EmbedConstructor(Object.assign(target.embeds[0], { fields: [target.embeds[0].fields[0], needsToBeEdited] })));
				hasBeenEditedBefore = target.url;
				return send();
			});

			// Message
			const send = () => {
				const notifEmbed = new EmbedConstructor()
												.setTitle('Message deleted')
												.setColor('ff0000')
												.setDescription(`${message.member.displayName} <@!${message.member.id}> has deleted a message in <#${message.channel.id}>${hasBeenEditedBefore ? `\n\n*This message seems like it has been edited before. Refer to [this message](${hasBeenEditedBefore}) for details.*` : ''}`)
												.setTimestamp();

				if (!hasBeenEditedBefore) notifEmbed.addField('Content', message.content);

				const hasEmbeds = message.embeds.length > 0;
				const hasAttachments = message.attachments.size > 0;
				const isPinned = message.pinned;

				const { everyone: mentionEveryone, roles: mentionRoles, users: mentionUsers, channels: mentionChannels } = message.mentions;

				const FooterArray0 = [];
				const FooterArray1 = [];
				if (hasEmbeds) FooterArray0.push(`${message.embeds.length} embed${message.embeds.length > 1 ? 's' : ''}`);
				if (hasAttachments) FooterArray0.push(`${message.attachments.size} attachment${message.attachments.size > 1 ? 's' : ''}`);
				if (mentionEveryone || mentionRoles.size > 0 || mentionUsers.size > 0) FooterArray1.push(`**Mentions:** \n\`everyone / here:${mentionEveryone ? 'true' : 'false'}\`\n\`Users (${mentionUsers.size})\` ${mentionUsers.size > 0 ? `${mentionUsers.size > 10 ? '' : mentionUsers.map(user => `<@!${user.id}>`)}` : ''}\n\`Roles (${mentionRoles.size})\` ${mentionRoles.size > 0 ? `${mentionRoles.size > 10 ? '' : mentionRoles.map(role => `<@&${role.id}>`)}` : ''}\n\`Channels (${mentionChannels.size})\` ${mentionChannels.size > 0 ? `${mentionChannels.size > 10 ? '' : mentionChannels.map(channel => `<#${channel.id}>`)}` : ''}`);

				if (FooterArray0.length > 0 || FooterArray1.length > 0) notifEmbed.addField('Associated', `${FooterArray0.length > 0 ? `\`${FooterArray0.join(', ')}\`` : ''}\n${FooterArray1.join(' ')}`);
				if (isPinned) notifEmbed.setFooter('Pinned: true');
				LogChannel.send(notifEmbed);

				if (hasEmbeds)
				{
					LogChannel.send({
						description: 'The message has associated embeds below.',
					});
					message.embeds.forEach(embed => {
						LogChannel.send(embed);
					});
				}
				if (hasAttachments)
				{
					LogChannel.send({
						description: 'The message has associated files below.',
					});
					message.attachments.forEach(file => {
						LogChannel.send(new MessageAttachment(file.url, file.name, file));
					});
				}
			};
		}

		const History = data.MessageLog;
		const LogHoldLimit = data.LogHoldLimit;

		let User = History.get(message.author.id);
		if (!User)
		{
			User = {
				tag: message.author.tag,
				nickname: message.member.nickname,
				deletedMessages: {},
			};
			History.set(User.id, User);
		}

		let DeletedHistory = User.deletedMessages;
		if (DeletedHistory === undefined) DeletedHistory = {};
		if (User.tag !== message.author.tag) User.tag = message.author.tag;
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
		client.GuildDatabase.update(message.guild, { MessageLog: History });
		// Database operations
	},
};