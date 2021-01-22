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

				// Flagged for changes since designs issues for eval
				if (!hasBeenEditedBefore) notifEmbed.addField('Content', message.content.length > 1024 ? message.content.substr(0, 1021) + '...' : message.content || '`The deleted message does not contain any text.`');

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
					LogChannel.send(new EmbedConstructor({
						description: 'The message has associated embeds below.',
					}));
					message.embeds.forEach(embed => {
						LogChannel.send(embed);
					});
				}
				if (hasAttachments)
				{
					LogChannel.send(new EmbedConstructor({
						description: 'The message has associated files below.',
					}));
					message.attachments.forEach(file => {
						LogChannel.send(new MessageAttachment(file.url, file.name, file));
					});
				}
			};
		}

		// Database operations
		const History = data.MessageLog;
		const LogHoldLimit = data.LogHoldLimit;

		let User = History.get(message.author.id);
		if (!User)
		{
			User = {
				tag: message.author.tag,
				nickname: message.author.nickname,
				deletedMessages: {},
			};
			History.set(message.author.id, User);
		}

		const DeletedHistory = User.deletedMessages;
		if (User.tag !== message.author.tag) User.tag = message.author.tag;
		if (User.nickname !== message.author.nickname) User.nickname = message.member.nickname;

		const deletedMsgObject = {
			displayName: message.member.nickname || message.author.username,
			deletedTimestamp: Date.now(),
			message: convertMsgObject(message),
		};

		DeletedHistory[deletedMsgObject.deletedTimestamp] = deletedMsgObject;

		let array = Object.keys(DeletedHistory).map(x => parseInt(x));
		while (Object.keys(DeletedHistory).length > LogHoldLimit)
		{
			delete DeletedHistory[`${Math.min(...array)}`];
			array.sort((a, b) => b - a);
			array = array.slice(0, array.length - 1);
		}

		User.deletedMessages = DeletedHistory;

		History.set(message.author.id, User);
		client.GuildDatabase.update(message.guild, { MessageLog: History });
	},
};

function convertMsgObject(message)
{
	const msg = cleanAbstractObject(message);

	msg.attachments = cleanAbstractObject(message.attachments);
	// msg.author = cleanAbstractObject(message.author);
	msg.mentions = {};
	msg.mentions.everyone = message.mentions.everyone;

	msg.mentions.users = [];
	msg.mentions.channels = [];
	message.mentions.users.forEach(user => msg.mentions.users.push(user.id));
	message.mentions.channels.forEach(channel => msg.mentions.channels.push(channel.id));

	for (const key in msg)
	{
		if (msg[key] === null || msg[key] === undefined) delete msg[key];
	}
	return msg;
}

function cleanAbstractObject(obj)
{
	if (typeof obj !== 'object') return [0];
	return JSON.parse(JSON.stringify(obj));
}