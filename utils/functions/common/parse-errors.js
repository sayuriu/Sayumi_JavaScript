const { Error } = require("mongoose");

const dirArr = __dirname.split('\\');
const root = dirArr.splice(0, dirArr.length - 3).join('\\');

function ParseSyntaxError(error, map)
{
	let acc = [];
	const out = [];
	// Parse all new lines chars
	error = error.stack.split('\n');
	// Parse tab chars
	error.forEach(e => acc = acc.concat(e.split('\t')));

	acc.forEach(a => {
		if (a.trim() === '' || a.trim() === a.match(/\^+/g)) return;
		out.push(a.trim());
	});

	const processedOut = out.join('\n');
	const err = processedOut.slice(processedOut.indexOf('SyntaxError'), processedOut.indexOf('\n', processedOut.indexOf('SyntaxError')));
	const errorType = err.split(':')[0];
	const errorMessage = err.split(':')[1].trim();

	let location = out[0].slice(root.length + 1, out[0].length);
	const line = location.split(':')[1];
	location = location.split(':')[0];

	if (map.has(errorType)) map.set(errorType, map.get(errorType).concat([[errorMessage, location, line]]));
	else map.set(errorType, [[errorMessage, location, line]]);
}

/** Parse errors objects.
 *
 * @param {Error} error The error.
 * @param {Map<string, [Error[]]>} map Map for iterating through prossesed ones later.
 */
module.exports = function ParseError(error, map)
{
	if (error instanceof SyntaxError) return ParseSyntaxError(error, map);
	if (error instanceof TypeError) null;
	if (error instanceof EvalError) null;
	if (error instanceof ReferenceError) null;
	if (error instanceof RangeError) null;
	else if (error instanceof Error) null;
};

// Problems: How are those errors constructed?