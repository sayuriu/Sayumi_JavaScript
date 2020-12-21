'type-check';
import { ChannelData } from 'discord.js';

interface Sayumi_Commands {
    name: string,
	aliases?: string[],
	description?: string,
	guildOnly?: boolean,
	stable: boolean,
	args?: boolean | false,
	reqPerms?: string[] | string,
	reqUser?: string[] | string,
	group: string[],
    usage?: string[] | string,
	usageSyntax?: SyntaxString,
	notes: string[] | string,
}
type Channel = ChannelData;
type SyntaxString = string;

declare class Methods
{
    public static ArrayEqualityCheck(Array1: any[], Array2: any[]): boolean;
	public static ArrayOrString(input: string[]): { output: any[], boolean: boolean };
    public static channelCheck(channel: ChannelData | object): Channel
	public static clean(input: string): string;
	public static convertBytes(bytes: number): string;
	public static convertDate(date: number | string, month: number | string, year: number | string): string;
	public static CompareObjects(target: object, source: object): boolean;
	/** Stating files in the console output.
     * @param {object} dir The directory object to pass in. Usually it's taken from the loader.
     * @param {string} type The type of data you want to inspect. For Discord, it's reduced to commands, events and database models. This will be added more in the future.
     * @see method `Loader.ExeLoader` and `Loader.EventLoader` (Loader.js)
     */
    public static Counter(dir: object, type: string): void;
	public static duplicationCheck(array: any[], type?: string, WarnArray?: string[]): void 
	public static DateTime(): {date: string, dateID: string, month: string, GMT: string, year: string, hrs: string, min: string, sec: string};
	public static daysAgo(date: Date, compare?: Date): {daysRaw: number, years: number, month: number, day: number, message: string};
	public static EscapeRegExp(input: string): string;
	public static getExtension(fileName: string): string;
	public static getAllFiles(path: string): string[];
	public static joinArrayString(stringArray: string[]): false | string  
	public static Greetings(): string
	public static PermissionsCheck(TargetCommand: Sayumi_Commands):  { clientPass: boolean, userPass: boolean, required: string[], array: boolean };
	public static Randomized(input: any[]): any;
	public static ShiftToLast(array: any[], callback: Function): Array[] { return array =  array.push(array.splice(array.findIndex(callback), 1)[0]); }
}

module.exports = Methods;