const { warn } = require('../../Logger');

module.exports = function(stringArray = [])
{
	if (!stringArray) return false;
	if (!stringArray.length)
	{
		warn('ArrayString has no item.');
		return false;
	}
	// if (!stringArray.length) throw new ReferenceError('ArrayString has no item.');
	return stringArray.join('\n');
};