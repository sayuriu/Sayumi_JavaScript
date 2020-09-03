const discord = require('discord.js');
const Functions = require('./Functions');

const functions = new Functions;
const { date, month, year } = functions.DateTime();

const channelCheck = functions.channelCheck;
const convertDate = functions.convertDate;
const currentDate = convertDate(date, month, year);

module.exports = class EmbedConstructor {
    /**
     * The embed used for update patches.
     * @param {string} header The title of the update.
     * @param {string} message This contains the contents of the update.
     * @param {number} versionNumber The current version of this unit.
     * @param {number?} updateCode  `0: major | 1: minor | 2: patches`
     */
    update(header, message)
    {
        const ver = require('../package.json').version;
        const updateReport = new discord.MessageEmbed()
                .setTitle('Update | Patch ' + `${ver}` + `[\`${currentDate}\`]`)
                .setColor('42e3f5')
                .addField(header, message)
                .setFooter(``)
                .setTimestamp();
        return updateReport;
    }

    bugReport(user, message)
    {
        const bugReport = new discord.MessageEmbed()
                                    .setTitle('Bug Reports')
                                    .setColor('f0ff19')
                                    .setTimestamp()
                                    .addField('User', user.tag)
                                    .addField('Problem', message);
        return bugReport;
    }

    error(message, errorMsg)
    {
        const res = channelCheck(message.channel);
        if (errorMsg === null) errorMsg = 'null';
        const errorReport = new discord.MessageEmbed()
                                        .setTitle('An error has occured.')
                                        .setDescription(`${res.message}`)
                                        .setColor('ff0000')
                                        .addField(`*Executed by ${message.author.tag}*\nError: \`${errorMsg}\``)
                                        .setFooter('All devs, please check the error and fix it ASAP!');
        return errorReport;
    }

    // Moderation
    ban(message, target, duration, reason)
    {
        const banReport = new discord.MessageEmbed()
                                     .setTitle(`${target.tag} has been banned.`)
                                     .setColor('b5001b')
                                     .setDescription(`*Banned by ${message.author.tag} for \`${duration}\`*`)
                                     .addField('Provided reasons', `*${reason}*`)
                                     .setTimestamp();
        const banReport_Short = new discord.MessageEmbed()
                                        .setDescription(`**${target.tag}** \`ID${target.id}\` **has been banned**\n${reason}`)
                                        .setColor('b5001b')
                                        .setTimestamp();
        const ban = {
            full: banReport,
            short: banReport_Short,
        };
        return ban;
    }

    kick(message, target, reason)
    {
        const kickReport = new discord.MessageEmbed()
                                     .setTitle(`${target.tag} \`UserID :${target.id}\` has been kicked.`)
                                     .setColor('bf001d')
                                     .setDescription(`*By ${message.author.tag}* [\`ID${message.author.id}\`]`)
                                     .addField('Provided reasons', `*${reason}*`)
                                     .setTimestamp();
        const kickReport_Short = new discord.MessageEmbed()
                                     .setDescription(`**${target.tag}** \`ID${target.id}\` **has been kicked**\n${reason}`)
                                     .setColor('bf001d')
                                     .setTimestamp();
        const kick = {
            full: kickReport,
            short: kickReport_Short,
        };
        return kick;
    }

    mute(message, target, duration, reason)
    {
        const muteReport = new discord.MessageEmbed()
                                    .setTitle(`${target.tag} has been muted.`)
                                    .setColor('f6ff00')
                                    .setDescription(`*By ${message.author.tag}, for \`${duration}\`*`)
                                    .addField('Provided reasons', `*${reason}*`)
                                    .setTimestamp();
        const muteReport_Short = new discord.MessageEmbed()
                                    .setColor('f6ff00')
                                    .setDescription(`**${target.tag}** \`ID${target.id}\` **has been muted**\n${reason}`)
                                    .setTimestamp();
        const mute = {
            full: muteReport,
            short: muteReport_Short,
        };
        return mute;
    }

    // Utilities
    messageLog(message, object)
    {
        if (message === null) message = {
            author: {
                username: null,
            },
            createdAt: 'n/a',
            editedAt: 'n/a',
        };
        if (object === null || object === undefined) object = {
            status: null,
            channelID: null,
            logLimit: null,
        };
        const info = new discord.MessageEmbed()
                            .setColor('#ded181')
                            .setDescription(`Status: ${object.status ? `Enabled\n Inform channel: ${object.channelID === null || object.channelID === '' ? 'None' : `<#${object.channelID}>`}` : 'Disabled'} \nLog limit per user: \`${object.logLimit}\` (This can't be disabled)`)
                            .setFooter(`Settings: Message changes`);
        const deleted = new discord.MessageEmbed()
                                .setColor('#fa1933')
                                .setTitle(`Deleted message (${message.author.tag})`)
                                .setDescription(`\`"${message.content}"\``)
                                .setFooter(`Message timestamp: ${message.createdAt}`);
        const updated = new discord.MessageEmbed()
                                .setColor('#f7700f')
                                .setTitle(`Edited message (${message.author.username})`)
                                .addFields(
                                    { name: 'Original', value: `${object.oldMessage}` },
                                    { name: 'Edited', value: `${object.newMessage}` },
                                )
                                .setFooter(`Message timestamp: ${message.editedAt}`);
        const res = {
            info: info,
            deleted: deleted,
            updated: updated,
        };
        return res;
    }
};
