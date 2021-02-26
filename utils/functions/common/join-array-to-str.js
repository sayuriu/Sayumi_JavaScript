const { warn } = require('../../Logger');

module.exports = function(joiner = '\n', ...stringArray)
{
	if (!stringArray) return false;
	if (!stringArray.length)
	{
		warn('ArrayString has no item.');
		return false;
	}
	let out;
	for (const i of stringArray)
	{
		out = out.concat(i);
	}
	// if (!stringArray.length) throw new ReferenceError('ArrayString has no item.');
	return out.join(joiner);
};