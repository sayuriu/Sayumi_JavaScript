const { warn } = require('../../Logger');

module.exports = function(array, type = 'Item', WarnArray = [])
{
	if (!WarnArray) WarnArray = null;
	if (!type || type === undefined) type = 'Item';
	if (typeof type !== 'string') throw new TypeError('[Global Functions > Duplication Check] The type specified is not a string.');
	type = type.replace(type.substr(0, 1), type.substr(0, 1).toUpperCase());
	const findDuplicates = arr => arr.filter((item, index) => arr.indexOf(item) != index);
	const res = [...new Set(findDuplicates(array))];
	if (res.length)
	{
		switch(WarnArray)
		{
			case null:
			{
				WarnArray = [];
				for(const i in res) WarnArray.push(`${type} "${res[i]}": Duplicates found.`);
				if (WarnArray.length) warn(this.joinArrayString(WarnArray));
				break;
			}
			case WarnArray:
			{
				for(const i in res)
				{
					if (WarnArray.length > 0) WarnArray.push(`${type} "${res[i]}": Duplicates found.`);
				}
				break;
			}
		}
	}
};