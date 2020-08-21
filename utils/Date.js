// let array = [];

// for (let i = 1; i < 5; i++)
// {
// 	array.push({
// 		id: i,
// 		thing: i + Math.floor(Math.random() * 1),
// 	});
// }

// console.log(array);
// console.log(array[0]);

const Loader = require('./Loader');
const { Collection } = require('discord.js');
const loader = new Loader;
const client = {
	CommandList: new Collection(),
	CommandAliases: new Collection(),
};
console.log(loader.ExeLoader('../utils', client));
// console.log(client);

// const Functions = require('./Functions');
// const functions = new Functions;
// const Array = ['hi', 'this is a message'];

// console.log(functions.joinArrayString(Array));