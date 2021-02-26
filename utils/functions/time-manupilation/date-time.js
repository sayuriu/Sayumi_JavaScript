/** Returns a time object. */

module.exports = function()
{
	const date = new Date();
	const time = date.toTimeString();
	const month = date.getMonth() + 1;
	const res = {
		date: `${date.getDate() < 10 ? '0' : ''}${date.getDate()}`,
		dateID: Math.floor(Date.now() / 86400000),
		month: `${month < 10 ? '0' : ''}${month}`,
		GMT: date.toString().substr(28, 5),
		year: date.getFullYear().toString(),
		hrs: time.substr(0, 2),
		min: time.substr(3, 2),
		sec: time.substr(6, 2),
	};
	return res;
};