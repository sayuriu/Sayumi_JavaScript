// Base on here if you wanna construct a custom command.

interface command<T> {
	name: String;
	aliases: String | Array<T>;   		// [Command aliases]
	description: String;
	group: String | Array<T>;
	stable: Boolean; 						   // [If the command works normally]
	cooldown: Number; 					  // [Cooldown amount, in seconds.]
	guildCount: Boolean; 				    // (optional) [If this is checked, the command will have its cooldown across the guild.]
	guildOnly: Boolean; 				    // (optional) [Guild-only commands. `false` by default, if not defined.]
	args: Boolean; 						 	   // [If command takes args]
	reqArgs: Boolean; 					    // [If the command must require args. `false` by default, if not defined.]
	reqPerms: String | Array<T>; 	 // [Permission strings, required for both Sayumi and the user]
	reqUser: String | Array<T>;   	  // [Permitted user (Must associate with `reqPerms`)]
	nsfw: Boolean; 							  // (optional) [If the command is NSFW or partial NSFW]
	master_explicit: Boolean; 		   // [Master-explict commands, means nobody but her master can execute this command]
	usage: String | Array<T>;  			// [A prefix is pre-included, so only provide parameters here]
	terminal: Boolean;					    // (optional) [Eval-explict]
	notes: String | Array<T>;   		// (optional) [Extra notes for this command. Displays on `help` index]
	onTrigger: Function; 				  // [This will excute actions when this command is called.]
}
let input: string;
export var Command: command<typeof input>;