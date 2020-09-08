// Base on here if you wanna construct a custom command.

const command = {
	name: String,
	aliases: String || Array,   // [Command aliases]
	description: String,
	group: String || Array,
	stable: Boolean ? Boolean : false, // [If the command works normally]
	cooldown: Number, // [Cooldown amount, in seconds.]
	guildCount: Boolean ? Boolean : false, // (optional) [If this is checked, the command will have its cooldown across the guild.]
	guildOnly: Boolean ? Boolean : false, // (optional) [Guild-only commands. `false` by default, if not defined.]
	args: Boolean ? Boolean : false, // [If command takes args]
	reqArgs: Boolean ? Boolean : false, // [If the command must require args. `false` by default, if not defined.]
	reqPerms: String || Array, // [Permission strings, required for both Sayumi and the user]
	reqUser: String || Array,   // [Permitted user (Must associate with `reqPerms`)]
	nsfw: Boolean ? Boolean : false, // (optional) [If the command is NSFW or partial NSFW]
	master_explicit: Boolean ? Boolean : false, // [Master-explict commands, means nobody but her master can execute this command]
	usage: String || Array,   // [A prefix is pre-included, so only provide parameters here]
	terminal: Boolean ? Boolean : false, // (optional) [Eval-explict]
	notes: String || Array,   // (optional) [Extra notes for this command. Displays on `help` index]
	onTrigger: Function, // [This will excute actions when this command is called.]
}
export var Command: typeof command;

// module.exports.any = (something);
// Example:
module.exports.any = Command;