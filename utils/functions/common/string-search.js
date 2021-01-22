// @flags: buggy?

module.exports = function(regEx = /\u200b/g, string = '')
{
	// regEx = new RegExp(regEx.replace(/([\\.+*?\\[^\\]$(){}=!<>|:])/g, '\\$1'));
	const indice = [];
	let res = [];
	while ((res = regEx.exec(string))) indice.push(res.index);
	return indice;
};