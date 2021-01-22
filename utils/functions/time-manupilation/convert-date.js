/** Gets the date input and returns a 6-digit number. Useful for patch numbers.
* @param {string | number} date
* @param {string | number} month
* @param {string | number} year
* @see procedure `DateTime` (date-time.js)
*/
module.exports = function(date, month, year)
{
	if (
		typeof (date, month, year) !== 'string' &&
		typeof (date, month, year) !== 'number'
		)
			throw new TypeError ('[Global Functions > ConvertDate] Invalid input type given.');
	if (typeof year === 'number') year = `${year}`;
	return `${month}${date}${year.substr(2, 2)}`;
};