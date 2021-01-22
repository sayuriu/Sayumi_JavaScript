const { readdirSync, statSync } = require('fs');
const { join } = require('path');
const convertBytes = require('./convert-bytes');

function getAllFiles(path)
{
	const files = readdirSync(path);
	let arrayOfFiles = [];

	files.forEach(file => {
		const fullPath = join(path, file);
		if (statSync(fullPath).isDirectory())
			arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
		else arrayOfFiles.push(join(path, file));
	});

	return arrayOfFiles;
}

function getTotalSize(path)
{
	const arrayOfFiles = getAllFiles(path);
	let totalSize = 0;

	arrayOfFiles.forEach(filePath => totalSize += statSync(filePath).size);
	return convertBytes(totalSize);
}

module.exports = getTotalSize;