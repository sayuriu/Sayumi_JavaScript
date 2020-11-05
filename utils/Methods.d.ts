import * as FileSystem from 'fs';
import * as responses from './json/Responses.json';
import * as Logger from './Logger';
import * as chalk from'chalk';

import { config } from 'dotenv';
import { ChannelData } from 'discord.js';

type Sayumi_Commands = object;

declare class Methods
{
	public ArrayEqualityCheck(Array1: Array[], Array2: Array[]): boolean;
	public ArrayOrString(input: Array[]): { output: Array | any, boolean: boolean };
	public channelCheck(channel: ChannelData | object): string;
	public clean(input: string): string;
	public convertBytes(bytes: number): string;
	public convertDate(date: number | string, month: number | string, year: number | string): string;
	public CompareObjects(target: object, source: object): boolean;
	public Counter(dir: object, type: string): void;
	public duplicationCheck(array: Array[], type?: string, WarnArray?: Array[]): void;
	public DateTime(): {date: string, dateID: string, month: string, GMT: string, year: string, hrs: string, min: string, sec: string};
	public daysAgo(date: Date): {daysRaw: number, years: number, month: number, day: number, message: string};
	public EscapeRegExp(string: string): string;
	public getExtension(fileName: string): string;
	public getAllFiles(path: string): string[];
	public joinArrayString(stringArray: string[]): string;
	public Greetings(): string;
	public PermissionsCheck(TargetCommand: Sayumi_Commands): { clientPass: boolean, userPass: boolean, required: string[], array: boolean };
	public Randomized(input: any[]): any;
	public ShiftToLast(array: Array[], callback: Function): Array[];
}