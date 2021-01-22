module.exports = function(TargetCommand, message)
{
	let uConfirm = true;
	let meConfirm = true;
	let array = false;
	const required = [];
	if (Array.isArray(TargetCommand.reqPerms))
	{
		TargetCommand.reqPerms.forEach(permission => {
			if (message.member.permissions.has(permission)) return;
			uConfirm = false;
		});

		TargetCommand.reqPerms.forEach(permission => {
			if (message.guild.me.permissions.has(permission)) return;
			required.push(permission);
			array = true;
			meConfirm = false;
		});
	}
	else
	{
		if (!message.member.permissions.has(TargetCommand.reqPerms)) uConfirm = false;
		if (!message.guild.me.permissions.has(TargetCommand.reqPerms)) meConfirm = false;
	}
	return { clientPass: meConfirm, userPass: uConfirm, required: required, array: array };
};