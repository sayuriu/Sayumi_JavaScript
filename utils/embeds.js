const { MessageEmbed } = require('discord.js');
const Methods = require('./Methods');

const { date, month, year } = Methods.DateTime();
const currentDate = Methods.convertDate(date, month, year);
const channelCheck = Methods.channelCheck;

module.exports = class EmbedConstructor {
    /**
     * The embed used for update patches.
     * @param {string} header The title of the update.
     * @param {string} message This contains the contents of the update.
     * @param {number} versionNumber The current version of this unit.
     * @param {number?} updateCode  `0: major | 1: minor | 2: patches`
     */
    static update(header, message)
    {
        const ver = require('../package.json').version;
        const updateReport = new MessageEmbed()
                .setTitle('Update | Patch ' + `${ver}` + `[\`${currentDate}\`]`)
                .setColor('42e3f5')
                .addField(header, message)
                .setFooter(``)
                .setTimestamp();
        return updateReport;
    }

    static bugReport(user, message)
    {
        const bugReport = new MessageEmbed()
                                    .setTitle('Bug Reports')
                                    .setColor('f0ff19')
                                    .setTimestamp()
                                    .addField('User', user.tag)
                                    .addField('Problem', message);
        return bugReport;
    }

    static error(message, errorMsg)
    {
        const res = channelCheck(message.channel);
        if (errorMsg === null) errorMsg = 'null';
        const errorReport = new MessageEmbed()
                                        .setTitle('An error has occured.')
                                        .setDescription(`${res.message}\nExecuted by ${message.author.tag}`)
                                        .setColor('ff0000')
                                        .addField('Received error:', `\`${errorMsg}\``)
                                        .setFooter('All devs, please check the error and fix it ASAP!');
        return errorReport;
    }

    // Moderation
    static ban(message, target, duration, reason)
    {
        const banReport = new MessageEmbed()
                                     .setTitle(`${target.tag} has been banned.`)
                                     .setColor('b5001b')
                                     .setDescription(`*Banned by ${message.author.tag} for \`${duration}\`*`)
                                     .addField('Provided reasons', `*${reason}*`)
                                     .setTimestamp();
        const banReport_Short = new MessageEmbed()
                                        .setDescription(`**${target.tag}** \`ID${target.id}\` **has been banned**\n${reason}`)
                                        .setColor('b5001b')
                                        .setTimestamp();
        const ban = {
            full: banReport,
            short: banReport_Short,
        };
        return ban;
    }

    static kick(message, target, reason)
    {
        const kickReport = new MessageEmbed()
                                     .setTitle(`${target.tag} \`UserID :${target.id}\` has been kicked.`)
                                     .setColor('bf001d')
                                     .setDescription(`*By ${message.author.tag}* [\`ID${message.author.id}\`]`)
                                     .addField('Provided reasons', `*${reason}*`)
                                     .setTimestamp();
        const kickReport_Short = new MessageEmbed()
                                     .setDescription(`**${target.tag}** \`ID${target.id}\` **has been kicked**\n${reason}`)
                                     .setColor('bf001d')
                                     .setTimestamp();
        const kick = {
            full: kickReport,
            short: kickReport_Short,
        };
        return kick;
    }

    static mute(message, target, duration, reason)
    {
        const muteReport = new MessageEmbed()
                                    .setTitle(`${target.tag} has been muted.`)
                                    .setColor('f6ff00')
                                    .setDescription(`*By ${message.author.tag}, for \`${duration}\`*`)
                                    .addField('Provided reasons', `*${reason}*`)
                                    .setTimestamp();
        const muteReport_Short = new MessageEmbed()
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
    static messageLog(message, object, oldMsg, newMsg)
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
        if (oldMsg === null || oldMsg === undefined) oldMsg = {
            author: {
                tag: null,
                id: null,
            },
            content: 'n/a',
        };
        if (newMsg === null || newMsg === undefined) newMsg = {
            author: {
                tag: null,
                id: null,
            },
            content: 'n/a',
        };
        if (message.embeds) message.content = 'type EMBED';
        const info = new MessageEmbed()
                            .setColor('#ded181')
                            .setDescription(`Status: ${object.status ? `Enabled\n Inform channel: ${object.channelID === null || object.channelID === '' ? 'None' : `<#${object.channelID}>`}` : 'Disabled'} \nLog limit per user: \`${object.logLimit}\` (This can't be disabled)`)
                            .setFooter(`Settings: Message changes`);
        const deleted = new MessageEmbed()
                                .setColor('#fa1933')
                                .setTitle(`Deleted message (${message.author.tag})`)
                                .setDescription(`\`${message.content}\``)
                                .setFooter(`Message timestamp: ${message.createdAt}`);
        const updated = new MessageEmbed()
                                .setTitle('Edited message')
                                .setDescription(`Author: ${oldMsg.author.tag}\`\nID: ${oldMsg.author.id}\``)
                                .setColor('#f7700f')
                                .addField('Orginal', `\`${oldMsg.content}\``)
                                .addField('Edited:', `\`${newMsg.content}\``)
                                .setTimestamp();
        const res = {
            info: info,
            deleted: deleted,
            updated: updated,
        };
        return res;
    }

    // NASA
    /**
     *
     * @param {object?} res
     * @param {object?} err
     */
    static nasa_apod(res, err)
    {
        const props = require('./json/Props.json').nasa;
        let embed = 'n/a';
        let error = null;
        let edited = null;

        if (typeof res === 'object' && res !== null)
        {
            const { title, copyright, date: capturedDate, hdurl, media_type, url } = res;
            if (media_type === 'image')
            {
                embed = new MessageEmbed()
                .setColor("#0033FF")
                .setTitle(title)
                .setThumbnail(props.icon)
                .setDescription(`[Image link](${hdurl} 'Full-resolution link of the image.')`)
                .setImage(hdurl)
                .setFooter(`${copyright || 'Unknown'} | ${capturedDate}\nReact to the emoji below to display image's description.`);

                edited = embed.setFooter(`${copyright ? copyright : 'Unknown'} | ${capturedDate}\nThis message is now inactive.`);
            }
            else if (media_type === 'video')
            {
                const id = url.slice(30, 41);

                embed = new MessageEmbed()
                .setColor("#0033FF")
                .setTitle(title)
                .setThumbnail(props.icon)
                .setDescription('Click on the title to wat')
                .setImage(`https://img.youtube.com/vi/${id}/hqdefault.jpg`)
                .setURL(url)
                .setFooter(`${copyright ? copyright : 'Unknown'} | ${capturedDate}\nReact to the emoji below to display video's description.`);

                edited = embed.setFooter(`${copyright} | ${capturedDate}\nThis message is now inactive.`);
            }
        }

        let errorShort;
        if (typeof err === 'object' && err !== null)
        {
            const { status, statusText, code, message } = err;
            error = new MessageEmbed()
                .setColor('red')
                .setTitle('Error')
                .setDescription(`*Encountered an error of code \`[${code}]\`:* \n${message}`)
                .setFooter(`${status}: ${statusText}`);

            // If short request
            errorShort = new MessageEmbed()
                    .setColor('red')
                    .setTitle('Error')
                    .setDescription(`Request errored: code \`${status}: ${statusText}\``);
        }
        return { response: embed, edited: edited, error: error, errorShort: errorShort };
    }

    static async serverInfo(message)
    {
        const regions = require('./json/Regions.json');
        const verifLevels = require('./json/VerifLevels.json');

        const server = message.guild;

        const onlineCount = await server.members.fetch().then(members => { return members.filter(member => member.presence.status === 'online'); });
        const vcCount = server.channels.cache.filter(channel => channel.type === 'voice').size;

        const verifLevel = verifLevels[server.verificationLevel];
        const joinDate = message.member.joinedAt.toUTCString().substr(0, 16);

        const memberCount = server.members.cache.size;
        const humanCount = server.members.cache.filter(member => !member.user.bot).size;
        const botCount = server.members.cache.filter(member => member.user.bot).size;

        const channelCount = server.channels.cache.size;
        const rolesCount = server.roles.cache.size;

        const createdAt = server.createdAt;
        const timeBefore = Methods.daysAgo(createdAt).message;

        return new MessageEmbed()
            .setTitle(server.name)
            .setColor("RANDOM")
            .setThumbnail(server.iconURL)
            .setDescription(`*GID: ${server.id}, region ${regions[server.region]}*`)
            .addField('Owner', server.owner)
            .addField('Verification level', verifLevel, true)
            .addField('Your join date', joinDate, true)
            .addField("Amount of dwellers", `\`All: ${memberCount} | Humans: ${humanCount} (${onlineCount.size} online) | Bots: ${botCount}\``)
            .addField('Channel count', `\`All: ${channelCount} | Text: ${channelCount - vcCount} | Voice: ${vcCount}\``, true)
            .addField('Roles count', `\`${rolesCount}\``, true)
            .setFooter(`Created date: ${createdAt.toUTCString().substr(0, 16)} (Around ${timeBefore} ago)`);
        // });
    }

    // TODO: Under construction.
    static async userInfo(message, member)
    {
        const activityType = require('./json/ActivityType.json');
        const ctx = canvas.getContext('2d');

        const activities = member.presence.activities;
        const clientDevice = member.presence.clientStatus;
        const clientStatus = member.presence.status;

        // Avatar design
        const canvas = require('canvas');
        const userAvatar = await canvas.loadImage(member.user.avatarURL());

        const embed = new MessageEmbed()
                                .setTitle(`${member.user.username}#${member.user.discriminator}${member.nickname ? `, aka. ${member.nickname}` : ''}`)
                                .setDescription(`\`| ID <${member.id}>\``)
                                .setThumbnail(member.user.avatarURL())
                                .addField("Join Dates", `Discord: at ${member.user.createdAt.toUTCString().substr(0, 16)} \n This server: at ${message.member.joinedAt.toUTCString().substr(0, 16)}`, true)
                                .setTimestamp()
                                .setColor('RANDOM');

        // Activity
        if (activities.length > 0)
        {
            let activityString = '';
            let index = 0;
            activities.forEach(activity => {
                index++;

                const name = activity.name;
                const emoji = activity.emoji;
                const type = activity.type;
                const url = activity.url;
                const details = activity.details;
                const state = activity.state;
                const appID = activity.applicationID;
                const timestamps = activity.timestamps;
                const party = activity.party;
                const assets = activity.assets;
                const createdTimestamp = activity.createdTimestamp;

                if (activity.type === 'CUSTOM_STATUS')
                {
                    const userString = `\`| ID <${member.id}>\`\n${emoji ? emoji.name : ''}*"${state}"*`;
                    return embed.setDescription(userString);
                }
                else
                {
                    const header = `(${activityType[type]}) \`${name}${state ? `: ${state}` : ''}\``;
                    const body = `${details ? `> ${details}` : ''}${assets ? `\n${assets.largeText}` : ''}`;

                    if (assets && assets.largeImage) embed.setFooter(`>`, assets.largeImageURL());

                    if (index === 0) activityString += `${header}\n${body}`;
                    else activityString += `\n${header}\n${body}`;
                }

            });
            embed.addField('Current Activities', `${activityString}`);
        }

        // Roles
        const roles = member.roles.cache;
        embed.addField(`Roles \`${roles.size}\``, roles.map(role => `<@&${role.id}>`));
        return embed;

        // Channels

    }
};